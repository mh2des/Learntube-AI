// AI Summary Component
// Display AI-generated summaries with multiple length options

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check,
  FileText,
  List,
  Zap
} from 'lucide-react';
import { useSummary, type SummaryLength } from '@/lib/ai';

interface AISummaryProps {
  transcript: string;
  videoTitle?: string;
}

export function AISummary({ transcript, videoTitle }: AISummaryProps) {
  const { generateSummary, generateTLDR, isLoading, error, summary } = useSummary();
  const [activeTab, setActiveTab] = useState<SummaryLength>('standard');
  const [tldr, setTldr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tldrLoading, setTldrLoading] = useState(false);

  const handleGenerate = async (length: SummaryLength) => {
    setActiveTab(length);
    await generateSummary(transcript, length, videoTitle);
  };

  const handleTLDR = async () => {
    setTldrLoading(true);
    const result = await generateTLDR(transcript);
    setTldr(result);
    setTldrLoading(false);
  };

  const copyToClipboard = () => {
    if (summary) {
      const text = `${summary.text}\n\nKey Points:\n${summary.keyPoints.map(p => `• ${p}`).join('\n')}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!transcript) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Transcribe the video first to generate AI summaries.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Summary
          </CardTitle>
          {summary && (
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              title="Copy summary"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TL;DR Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTLDR}
            disabled={tldrLoading}
            className="flex-shrink-0"
          >
            {tldrLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            TL;DR
          </Button>
          {tldr && (
            <p className="text-sm text-muted-foreground italic">{tldr}</p>
          )}
        </div>

        {/* Length Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SummaryLength)}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="brief" onClick={() => handleGenerate('brief')}>
                Brief
              </TabsTrigger>
              <TabsTrigger value="standard" onClick={() => handleGenerate('standard')}>
                Standard
              </TabsTrigger>
              <TabsTrigger value="detailed" onClick={() => handleGenerate('detailed')}>
                Detailed
              </TabsTrigger>
            </TabsList>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Generating summary...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {summary && !isLoading && (
            <div className="mt-4 space-y-4">
              <TabsContent value={activeTab} className="mt-0">
                {/* Summary Text */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <h4 className="font-medium">Summary</h4>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {summary.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {summary.wordCount} words
                  </p>
                </div>

                {/* Key Points */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <List className="h-4 w-4 mt-1 text-muted-foreground" />
                    <h4 className="font-medium">Key Points</h4>
                  </div>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point, index) => (
                      <li 
                        key={index} 
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-primary font-medium">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </div>
          )}

          {!summary && !isLoading && !error && (
            <div className="py-8 text-center text-muted-foreground">
              <p>Click a tab above to generate an AI summary</p>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AISummary;
