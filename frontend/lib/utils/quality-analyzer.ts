/**
 * Smart Quality Selector
 * Analyzes video characteristics and suggests optimal quality
 */

interface VideoAnalysis {
  suggestedQuality: string;
  reason: string;
  alternatives: { quality: string; reason: string }[];
}

interface VideoInfo {
  duration: number;
  qualities: string[];
  title: string;
  categories?: string[];
  is_live?: boolean;
}

/**
 * Analyzes video and suggests the best quality based on:
 * - Video duration (longer = lower quality suggested to save bandwidth)
 * - Content type (music videos = higher quality, tutorials = lower is fine)
 * - Available qualities
 * - Device detection (mobile = lower quality)
 */
export function analyzeAndSuggestQuality(video: VideoInfo): VideoAnalysis {
  const { duration, qualities, title, categories = [] } = video;
  
  // Sort qualities from highest to lowest
  const sortedQualities = [...qualities].sort((a, b) => {
    const getRes = (q: string) => {
      const match = q.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    return getRes(b) - getRes(a);
  });

  const highestQuality = sortedQualities[0];
  const has4K = sortedQualities.some(q => q.includes('2160') || q.includes('4K'));
  const has1080p = sortedQualities.some(q => q.includes('1080'));
  const has720p = sortedQualities.some(q => q.includes('720'));

  // Duration-based suggestions
  const durationMinutes = duration / 60;
  
  // Content type detection from title and categories
  const titleLower = title.toLowerCase();
  const isMusic = 
    categories.includes('Music') ||
    titleLower.includes('music video') ||
    titleLower.includes('official video') ||
    titleLower.includes('mv') ||
    titleLower.includes('lyrics');
  
  const isTutorial = 
    categories.includes('Education') ||
    categories.includes('Howto & Style') ||
    titleLower.includes('tutorial') ||
    titleLower.includes('how to') ||
    titleLower.includes('guide') ||
    titleLower.includes('learn');

  const isGaming = 
    categories.includes('Gaming') ||
    titleLower.includes('gameplay') ||
    titleLower.includes('walkthrough') ||
    titleLower.includes('gaming');

  const isPodcast = 
    titleLower.includes('podcast') ||
    titleLower.includes('interview') ||
    titleLower.includes('talk') ||
    durationMinutes > 60;

  const isShortForm = durationMinutes < 3;

  // Device detection (simplified - check screen width)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  let suggestedQuality: string;
  let reason: string;
  const alternatives: { quality: string; reason: string }[] = [];

  // Decision logic
  if (isShortForm) {
    // Short videos - suggest highest quality
    suggestedQuality = has4K ? '2160p' : has1080p ? '1080p' : highestQuality;
    reason = 'Short video - highest quality recommended for best experience';
    if (has1080p && suggestedQuality !== '1080p') {
      alternatives.push({ quality: '1080p', reason: 'Good balance for short content' });
    }
  } else if (isMusic) {
    // Music videos - prioritize quality
    suggestedQuality = has1080p ? '1080p' : highestQuality;
    reason = 'Music video detected - high quality for visual experience';
    if (has4K) {
      alternatives.push({ quality: '2160p', reason: 'Maximum visual quality' });
    }
    if (has720p) {
      alternatives.push({ quality: '720p', reason: 'Smaller file size' });
    }
  } else if (isTutorial) {
    // Tutorials - 720p is usually enough for readability
    suggestedQuality = has720p ? '720p' : has1080p ? '1080p' : highestQuality;
    reason = 'Tutorial detected - 720p provides clear text readability';
    if (has1080p) {
      alternatives.push({ quality: '1080p', reason: 'Sharper text and details' });
    }
    alternatives.push({ quality: '480p', reason: 'Save bandwidth if text is still readable' });
  } else if (isPodcast) {
    // Podcasts/long content - lower quality is fine
    suggestedQuality = has720p ? '720p' : '480p';
    reason = 'Long-form content - 720p saves significant space with minimal quality loss';
    if (has1080p) {
      alternatives.push({ quality: '1080p', reason: 'If storage is not a concern' });
    }
    alternatives.push({ quality: '480p', reason: 'Minimal storage, audio is what matters' });
  } else if (isGaming) {
    // Gaming - higher quality for motion
    suggestedQuality = has1080p ? '1080p' : highestQuality;
    reason = 'Gaming content - 1080p captures fast motion well';
    if (has4K) {
      alternatives.push({ quality: '2160p', reason: 'Maximum detail for gameplay' });
    }
  } else if (isMobile) {
    // Mobile device - suggest lower quality
    suggestedQuality = has720p ? '720p' : '480p';
    reason = 'Mobile device detected - 720p is optimal for smaller screens';
    if (has1080p) {
      alternatives.push({ quality: '1080p', reason: 'If viewing on larger screen later' });
    }
  } else if (durationMinutes > 30) {
    // Long videos - balance quality and size
    suggestedQuality = has720p ? '720p' : has1080p ? '1080p' : highestQuality;
    reason = `${Math.round(durationMinutes)} min video - 720p provides good quality with smaller file size`;
    if (has1080p) {
      alternatives.push({ quality: '1080p', reason: 'Higher quality if storage permits' });
    }
  } else {
    // Default - 1080p if available
    suggestedQuality = has1080p ? '1080p' : has720p ? '720p' : highestQuality;
    reason = '1080p provides excellent quality for most content';
    if (has4K) {
      alternatives.push({ quality: '2160p', reason: 'Maximum quality available' });
    }
    if (has720p && suggestedQuality !== '720p') {
      alternatives.push({ quality: '720p', reason: 'Smaller file size' });
    }
  }

  // Ensure suggested quality is actually available
  if (!sortedQualities.includes(suggestedQuality)) {
    suggestedQuality = sortedQualities[0] || 'best';
  }

  return {
    suggestedQuality,
    reason,
    alternatives: alternatives.filter(a => sortedQualities.includes(a.quality)),
  };
}

/**
 * Estimate file size based on quality and duration
 */
export function estimateFileSize(
  quality: string,
  durationSeconds: number,
  format: string = 'mp4'
): string {
  // Approximate bitrates (Mbps) for different qualities
  const bitrates: Record<string, number> = {
    '2160p': 35,
    '1440p': 16,
    '1080p': 8,
    '720p': 5,
    '480p': 2.5,
    '360p': 1,
    '240p': 0.5,
    '144p': 0.3,
  };

  const qualityKey = Object.keys(bitrates).find(k => quality.includes(k.replace('p', '')));
  const bitrate = bitrates[qualityKey || '720p'] || 5;

  // Calculate size in MB
  const sizeInMB = (bitrate * durationSeconds) / 8;

  if (sizeInMB >= 1024) {
    return `~${(sizeInMB / 1024).toFixed(1)} GB`;
  }
  return `~${Math.round(sizeInMB)} MB`;
}

/**
 * Get quality badge color
 */
export function getQualityBadgeColor(quality: string): string {
  if (quality.includes('2160') || quality.includes('4K')) return 'bg-purple-500';
  if (quality.includes('1440')) return 'bg-blue-500';
  if (quality.includes('1080')) return 'bg-green-500';
  if (quality.includes('720')) return 'bg-yellow-500';
  if (quality.includes('480')) return 'bg-orange-500';
  return 'bg-gray-500';
}
