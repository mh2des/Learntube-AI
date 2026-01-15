// Interactive Transcript Component
// Click-to-seek, search, highlight, export functionality

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Download, 
  Copy, 
  Check,
  FileText,
  Subtitles,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TranscriptSegment } from '@/lib/ai';

interface InteractiveTranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  onSegmentClick?: (segment: TranscriptSegment) => void;
}

export function InteractiveTranscript({
  segments,
  currentTime,
  onSeek,
  onSegmentClick,
}: InteractiveTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Find current segment based on time
  const currentSegmentIndex = segments.findIndex(
    (seg, i) => 
      currentTime >= seg.start && 
      (i === segments.length - 1 || currentTime < segments[i + 1].start)
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && scrollRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSegmentIndex]);

  // Filter segments by search
  const filteredSegments = searchQuery
    ? segments.filter(seg => 
        seg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : segments;

  // Format timestamp
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy all text
  const copyFullTranscript = useCallback(() => {
    const fullText = segments.map(s => s.text).join(' ');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [segments]);

  // Export functions
  const exportAsTXT = useCallback(() => {
    const text = segments.map(s => s.text).join('\n\n');
    downloadFile(text, 'transcript.txt', 'text/plain');
  }, [segments]);

  const exportAsSRT = useCallback(() => {
    const srt = segments.map((seg, i) => {
      const start = formatSRTTime(seg.start);
      const end = formatSRTTime(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    }).join('\n');
    downloadFile(srt, 'transcript.srt', 'text/plain');
  }, [segments]);

  const exportAsVTT = useCallback(() => {
    const vtt = 'WEBVTT\n\n' + segments.map((seg) => {
      const start = formatVTTTime(seg.start);
      const end = formatVTTTime(seg.end);
      return `${start} --> ${end}\n${seg.text}\n`;
    }).join('\n');
    downloadFile(vtt, 'transcript.vtt', 'text/vtt');
  }, [segments]);

  const exportAsJSON = useCallback(() => {
    const json = JSON.stringify(segments, null, 2);
    downloadFile(json, 'transcript.json', 'application/json');
  }, [segments]);

  if (segments.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
          <Subtitles className="h-12 w-12 mb-4 opacity-50" />
          <p className="font-medium mb-2">No transcript available</p>
          <p className="text-sm text-center max-w-md">
            Select a subtitle language from the options above, or generate an AI transcript by uploading the video file.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcript
            <span className="text-sm font-normal text-muted-foreground">
              ({segments.length} segments)
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyFullTranscript}
              title="Copy transcript"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportAsTXT}>
                  <FileText className="h-4 w-4 mr-2" />
                  Plain Text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsSRT}>
                  <Subtitles className="h-4 w-4 mr-2" />
                  SubRip (.srt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsVTT}>
                  <Subtitles className="h-4 w-4 mr-2" />
                  WebVTT (.vtt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsJSON}>
                  <FileText className="h-4 w-4 mr-2" />
                  JSON (.json)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4" ref={scrollRef}>
          <div className="space-y-2">
            {filteredSegments.map((segment, index) => {
              const isActive = segments.indexOf(segment) === currentSegmentIndex;
              const hasMatch = searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase());
              
              return (
                <div
                  key={segment.id}
                  ref={isActive ? activeSegmentRef : null}
                  onClick={() => {
                    onSeek(segment.start);
                    onSegmentClick?.(segment);
                  }}
                  className={`
                    group flex gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${isActive 
                      ? 'bg-primary/10 border-l-2 border-primary' 
                      : 'hover:bg-muted/50'
                    }
                    ${hasMatch ? 'bg-yellow-500/10' : ''}
                  `}
                >
                  <span className="text-xs font-mono text-muted-foreground min-w-[50px] pt-0.5">
                    {formatTime(segment.start)}
                  </span>
                  <p className={`text-sm leading-relaxed ${isActive ? 'font-medium' : ''}`}>
                    {highlightText(segment.text, searchQuery)}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Helper: Highlight search matches
function highlightText(text: string, query: string) {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() 
      ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700 rounded px-0.5">{part}</mark>
      : part
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Download file
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper: Format SRT timestamp
function formatSRTTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Helper: Format VTT timestamp
function formatVTTTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export default InteractiveTranscript;
