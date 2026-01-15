'use client';

import Image from 'next/image';
import { Clock, Eye, ThumbsUp, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { VideoInfo } from '@/types';

interface VideoCardProps {
  video: VideoInfo;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${year}-${month}-${day}`;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
          {video.duration_string}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="h-4 w-4" />
          <span className="line-clamp-1">{video.channel || video.uploader}</span>
        </div>

        <Separator className="my-3" />

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(video.view_count)} views</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{formatNumber(video.like_count)} likes</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(video.upload_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{video.duration_string}</span>
          </div>
        </div>

        {video.qualities && video.qualities.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-1">
              {video.qualities.slice(0, 5).map((quality) => (
                <span
                  key={quality}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                >
                  {quality}
                </span>
              ))}
              {video.qualities.length > 5 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  +{video.qualities.length - 5} more
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
