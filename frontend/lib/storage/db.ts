'use client'

// IndexedDB wrapper for persistent storage

const DB_NAME = 'youtube-toolkit'
const DB_VERSION = 1

export interface LibraryVideo {
  id: string
  videoId: string
  url: string
  title: string
  description: string
  thumbnail: string
  channelName: string
  channelId: string
  duration: number
  viewCount: number
  likeCount: number
  publishedAt: string
  addedAt: string
  updatedAt: string
  
  // Organization
  collectionId?: string
  tags: string[]
  isFavorite: boolean
  
  // Content
  transcript?: TranscriptData
  notes: Note[]
  bookmarks: Bookmark[]
  
  // Metadata
  chapters?: Chapter[]
  subtitles?: SubtitleTrack[]
}

export interface TranscriptData {
  text: string
  segments: TranscriptSegment[]
  language: string
  generatedAt: string
}

export interface TranscriptSegment {
  id: string
  text: string
  start: number
  end: number
}

export interface Note {
  id: string
  content: string
  timestamp?: number
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: string
  timestamp: number
  label: string
  createdAt: string
}

export interface Chapter {
  title: string
  startTime: number
  endTime: number
}

export interface SubtitleTrack {
  language: string
  label: string
  url?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
  videoCount: number
}

export interface Tag {
  id: string
  name: string
  color?: string
  videoCount: number
}

// Open database connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Videos store
      if (!db.objectStoreNames.contains('videos')) {
        const videoStore = db.createObjectStore('videos', { keyPath: 'id' })
        videoStore.createIndex('videoId', 'videoId', { unique: true })
        videoStore.createIndex('addedAt', 'addedAt', { unique: false })
        videoStore.createIndex('collectionId', 'collectionId', { unique: false })
        videoStore.createIndex('isFavorite', 'isFavorite', { unique: false })
      }

      // Collections store
      if (!db.objectStoreNames.contains('collections')) {
        const collectionStore = db.createObjectStore('collections', { keyPath: 'id' })
        collectionStore.createIndex('name', 'name', { unique: true })
      }

      // Tags store
      if (!db.objectStoreNames.contains('tags')) {
        const tagStore = db.createObjectStore('tags', { keyPath: 'id' })
        tagStore.createIndex('name', 'name', { unique: true })
      }

      // History store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' })
        historyStore.createIndex('videoId', 'videoId', { unique: false })
        historyStore.createIndex('viewedAt', 'viewedAt', { unique: false })
      }
    }
  })
}

// Generic CRUD operations
async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function get<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function put<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(item)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function clear(storeName: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Videos API
export const videosDB = {
  getAll: () => getAll<LibraryVideo>('videos'),
  get: (id: string) => get<LibraryVideo>('videos', id),
  put: (video: LibraryVideo) => put('videos', video),
  remove: (id: string) => remove('videos', id),
  clear: () => clear('videos'),

  async getByVideoId(videoId: string): Promise<LibraryVideo | undefined> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('videos', 'readonly')
      const store = transaction.objectStore('videos')
      const index = store.index('videoId')
      const request = index.get(videoId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  async getFavorites(): Promise<LibraryVideo[]> {
    const all = await getAll<LibraryVideo>('videos')
    return all.filter(v => v.isFavorite)
  },

  async getByCollection(collectionId: string): Promise<LibraryVideo[]> {
    const all = await getAll<LibraryVideo>('videos')
    return all.filter(v => v.collectionId === collectionId)
  },

  async getByTag(tagName: string): Promise<LibraryVideo[]> {
    const all = await getAll<LibraryVideo>('videos')
    return all.filter(v => v.tags.includes(tagName))
  },

  async search(query: string): Promise<LibraryVideo[]> {
    const all = await getAll<LibraryVideo>('videos')
    const lowerQuery = query.toLowerCase()
    return all.filter(v => 
      v.title.toLowerCase().includes(lowerQuery) ||
      v.description.toLowerCase().includes(lowerQuery) ||
      v.channelName.toLowerCase().includes(lowerQuery) ||
      v.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      v.transcript?.text.toLowerCase().includes(lowerQuery)
    )
  },
}

// Collections API
export const collectionsDB = {
  getAll: () => getAll<Collection>('collections'),
  get: (id: string) => get<Collection>('collections', id),
  put: (collection: Collection) => put('collections', collection),
  remove: (id: string) => remove('collections', id),
  clear: () => clear('collections'),

  async updateVideoCount(id: string): Promise<void> {
    const videos = await videosDB.getByCollection(id)
    const collection = await get<Collection>('collections', id)
    if (collection) {
      collection.videoCount = videos.length
      await put('collections', collection)
    }
  },
}

// Tags API
export const tagsDB = {
  getAll: () => getAll<Tag>('tags'),
  get: (id: string) => get<Tag>('tags', id),
  put: (tag: Tag) => put('tags', tag),
  remove: (id: string) => remove('tags', id),
  clear: () => clear('tags'),

  async getOrCreate(name: string): Promise<Tag> {
    const all = await getAll<Tag>('tags')
    const existing = all.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name,
      videoCount: 0,
    }
    await put('tags', newTag)
    return newTag
  },

  async updateVideoCount(name: string): Promise<void> {
    const videos = await videosDB.getByTag(name)
    const all = await getAll<Tag>('tags')
    const tag = all.find(t => t.name === name)
    if (tag) {
      tag.videoCount = videos.length
      await put('tags', tag)
    }
  },
}

// History API
export interface HistoryEntry {
  id: string
  videoId: string
  title: string
  thumbnail: string
  channelName: string
  viewedAt: string
  watchProgress?: number
}

export const historyDB = {
  getAll: async (): Promise<HistoryEntry[]> => {
    const entries = await getAll<HistoryEntry>('history')
    return entries.sort((a, b) => 
      new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
    )
  },
  
  get: (id: string) => get<HistoryEntry>('history', id),
  put: (entry: HistoryEntry) => put('history', entry),
  remove: (id: string) => remove('history', id),
  clear: () => clear('history'),

  async addEntry(video: Partial<HistoryEntry> & { videoId: string }): Promise<void> {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      videoId: video.videoId,
      title: video.title || '',
      thumbnail: video.thumbnail || '',
      channelName: video.channelName || '',
      viewedAt: new Date().toISOString(),
      watchProgress: video.watchProgress,
    }
    await put('history', entry)
  },
}

// Export helper
export async function exportLibrary(): Promise<string> {
  const videos = await videosDB.getAll()
  const collections = await collectionsDB.getAll()
  const tags = await tagsDB.getAll()
  
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    version: DB_VERSION,
    data: {
      videos,
      collections,
      tags,
    }
  }, null, 2)
}

// Import helper
export async function importLibrary(jsonString: string): Promise<{ 
  videos: number
  collections: number
  tags: number 
}> {
  const data = JSON.parse(jsonString)
  
  let videosImported = 0
  let collectionsImported = 0
  let tagsImported = 0

  if (data.data.collections) {
    for (const collection of data.data.collections) {
      await collectionsDB.put(collection)
      collectionsImported++
    }
  }

  if (data.data.tags) {
    for (const tag of data.data.tags) {
      await tagsDB.put(tag)
      tagsImported++
    }
  }

  if (data.data.videos) {
    for (const video of data.data.videos) {
      await videosDB.put(video)
      videosImported++
    }
  }

  return { videos: videosImported, collections: collectionsImported, tags: tagsImported }
}
