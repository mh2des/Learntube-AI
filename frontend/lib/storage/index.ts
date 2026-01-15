import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DownloadRecord {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  quality: string;
  format: string;
  downloadedAt: Date;
  fileSize?: number;
  duration?: number;
  channel?: string;
}

interface QueueItem {
  id: string;
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  quality: string;
  format: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  addedAt: Date;
  error?: string;
  type: 'video' | 'audio' | 'subtitle' | 'thumbnail';
  // Resume support fields
  downloadedBytes?: number;
  totalBytes?: number;
  formatId?: string;
}

// Partial download state for resumable downloads
interface PartialDownload {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  formatId: string;
  downloadType: 'video' | 'audio';
  downloadedBytes: number;
  totalBytes: number;
  chunks: ArrayBuffer[];
  lastUpdated: Date;
}

interface NamingTemplate {
  id: string;
  name: string;
  template: string; // e.g., "{title} - {channel} [{quality}]"
  isDefault: boolean;
}

interface YouTubeToolkitDB extends DBSchema {
  downloads: {
    key: string;
    value: DownloadRecord;
    indexes: { 'by-videoId': string; 'by-date': Date };
  };
  queue: {
    key: string;
    value: QueueItem;
    indexes: { 'by-status': string; 'by-date': Date };
  };
  templates: {
    key: string;
    value: NamingTemplate;
  };
  partialDownloads: {
    key: string;
    value: PartialDownload;
    indexes: { 'by-videoId': string };
  };
}

const DB_NAME = 'youtube-toolkit';
const DB_VERSION = 2; // Bumped version for new store

let dbInstance: IDBPDatabase<YouTubeToolkitDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<YouTubeToolkitDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<YouTubeToolkitDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Downloads store
      if (!db.objectStoreNames.contains('downloads')) {
        const downloadStore = db.createObjectStore('downloads', { keyPath: 'id' });
        downloadStore.createIndex('by-videoId', 'videoId');
        downloadStore.createIndex('by-date', 'downloadedAt');
      }

      // Queue store
      if (!db.objectStoreNames.contains('queue')) {
        const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
        queueStore.createIndex('by-status', 'status');
        queueStore.createIndex('by-date', 'addedAt');
      }

      // Templates store
      if (!db.objectStoreNames.contains('templates')) {
        const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
        
        // Add default templates
        templateStore.add({
          id: 'default',
          name: 'Default',
          template: '{title}',
          isDefault: true,
        });
        templateStore.add({
          id: 'detailed',
          name: 'Detailed',
          template: '{title} - {channel} [{quality}]',
          isDefault: false,
        });
        templateStore.add({
          id: 'dated',
          name: 'With Date',
          template: '{title} ({date})',
          isDefault: false,
        });
      }

      // Partial downloads store (for resume functionality) - added in version 2
      if (!db.objectStoreNames.contains('partialDownloads')) {
        const partialStore = db.createObjectStore('partialDownloads', { keyPath: 'id' });
        partialStore.createIndex('by-videoId', 'videoId');
      }
    },
  });

  return dbInstance;
}

// Download History
export async function addDownloadRecord(record: Omit<DownloadRecord, 'id' | 'downloadedAt'>): Promise<string> {
  const db = await getDB();
  const id = `${record.videoId}-${Date.now()}`;
  await db.add('downloads', {
    ...record,
    id,
    downloadedAt: new Date(),
  });
  return id;
}

// Alias for saveDownloadRecord
export async function saveDownloadRecord(record: {
  videoId: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  downloadedAt: number;
  fileSize?: number;
}): Promise<string> {
  return addDownloadRecord({
    videoId: record.videoId,
    title: record.title,
    thumbnail: record.thumbnail,
    format: record.format,
    quality: record.quality,
    fileSize: record.fileSize,
  });
}

export async function getDownloadHistory(limit = 50): Promise<DownloadRecord[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('downloads', 'by-date');
  return all.reverse().slice(0, limit);
}

export async function isVideoDuplicate(videoId: string): Promise<DownloadRecord | null> {
  const db = await getDB();
  const records = await db.getAllFromIndex('downloads', 'by-videoId', videoId);
  return records.length > 0 ? records[0] : null;
}

export async function clearDownloadHistory(): Promise<void> {
  const db = await getDB();
  await db.clear('downloads');
}

// Download Queue
export async function addToQueue(item: Omit<QueueItem, 'id' | 'addedAt' | 'status' | 'progress'>): Promise<string> {
  const db = await getDB();
  const id = `queue-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.add('queue', {
    ...item,
    id,
    status: 'pending',
    progress: 0,
    addedAt: new Date(),
  });
  return id;
}

export async function getQueue(): Promise<QueueItem[]> {
  const db = await getDB();
  return db.getAll('queue');
}

export async function getPendingQueue(): Promise<QueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('queue', 'by-status', 'pending');
}

export async function updateQueueItem(id: string, updates: Partial<QueueItem>): Promise<void> {
  const db = await getDB();
  const item = await db.get('queue', id);
  if (item) {
    await db.put('queue', { ...item, ...updates });
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('queue', id);
}

export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('queue');
}

// Partial Downloads (for resume functionality)
export async function savePartialDownload(partial: Omit<PartialDownload, 'lastUpdated'>): Promise<void> {
  const db = await getDB();
  await db.put('partialDownloads', {
    ...partial,
    lastUpdated: new Date(),
  });
}

export async function getPartialDownload(id: string): Promise<PartialDownload | undefined> {
  const db = await getDB();
  return db.get('partialDownloads', id);
}

export async function getPartialDownloadByVideoId(videoId: string): Promise<PartialDownload | undefined> {
  const db = await getDB();
  const partials = await db.getAllFromIndex('partialDownloads', 'by-videoId', videoId);
  return partials.length > 0 ? partials[0] : undefined;
}

export async function deletePartialDownload(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('partialDownloads', id);
}

export async function clearPartialDownloads(): Promise<void> {
  const db = await getDB();
  await db.clear('partialDownloads');
}

export async function getAllPartialDownloads(): Promise<PartialDownload[]> {
  const db = await getDB();
  return db.getAll('partialDownloads');
}

// Naming Templates
export async function getTemplates(): Promise<NamingTemplate[]> {
  const db = await getDB();
  return db.getAll('templates');
}

export async function addTemplate(template: Omit<NamingTemplate, 'id'>): Promise<string> {
  const db = await getDB();
  const id = `template-${Date.now()}`;
  await db.add('templates', { ...template, id });
  return id;
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('templates', id);
}

export async function setDefaultTemplate(id: string): Promise<void> {
  const db = await getDB();
  const templates = await db.getAll('templates');
  for (const template of templates) {
    await db.put('templates', {
      ...template,
      isDefault: template.id === id,
    });
  }
}

// Filename Generator
export function generateFilename(
  template: string,
  videoInfo: {
    title: string;
    channel?: string;
    quality?: string;
    format?: string;
    date?: string;
    duration?: string;
    id?: string;
  }
): string {
  const now = new Date();
  const dateStr = videoInfo.date || now.toISOString().split('T')[0];

  let filename = template
    .replace(/{title}/g, videoInfo.title)
    .replace(/{channel}/g, videoInfo.channel || 'Unknown')
    .replace(/{quality}/g, videoInfo.quality || 'best')
    .replace(/{format}/g, videoInfo.format || 'mp4')
    .replace(/{date}/g, dateStr)
    .replace(/{duration}/g, videoInfo.duration || '')
    .replace(/{id}/g, videoInfo.id || '');

  // Sanitize filename (remove invalid characters)
  filename = filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return filename;
}

export type { DownloadRecord, QueueItem, NamingTemplate, PartialDownload };
