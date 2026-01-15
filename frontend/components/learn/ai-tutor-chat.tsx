// AI Tutor Chat Component
// Interactive chat interface for asking questions about video content

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Trash2,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Book
} from 'lucide-react';
import { useAITutor, type TranscriptSegment } from '@/lib/ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface AITutorChatProps {
  transcript: string;
  videoTitle?: string;
  segments?: TranscriptSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
}

const QUICK_PROMPTS = [
  { icon: Sparkles, label: 'Summarize this', prompt: 'Can you give me a quick summary of the main points?' },
  { icon: Lightbulb, label: 'Key takeaways', prompt: 'What are the most important takeaways from this video?' },
  { icon: Book, label: 'Explain simply', prompt: 'Can you explain the main concept in simpler terms?' },
];

export function AITutorChat({ 
  transcript, 
  videoTitle, 
  segments = [],
  currentTime = 0,
  onSeek 
}: AITutorChatProps) {
  const { 
    sendMessage, 
    explain,
    extractConcepts,
    isLoading, 
    error, 
    messages, 
    concepts,
    clearChat 
  } = useAITutor(transcript, videoTitle);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Extract concepts on mount
  useEffect(() => {
    if (transcript && concepts.length === 0) {
      extractConcepts();
    }
  }, [transcript, concepts.length, extractConcepts]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const question = input;
    setInput('');
    await sendMessage(question);
    inputRef.current?.focus();
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleExplainTimestamp = async () => {
    if (segments.length === 0) return;
    
    const explanation = await explain(currentTime, segments, 'simple');
    if (explanation) {
      // Add as a message
      sendMessage(`Explain what's happening at ${formatTime(currentTime)}`);
    }
  };

  if (!transcript) {
    return (
      <Card className="h-full">
        <CardContent className="py-8 text-center text-muted-foreground">
          Transcribe the video first to chat with the AI tutor.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-500" />
            AI Tutor
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="py-8 space-y-6">
              {/* Welcome Message */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 mb-3">
                  <Bot className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-medium mb-1">Ask me anything!</h3>
                <p className="text-sm text-muted-foreground">
                  I can help you understand the video content, explain concepts, and answer questions.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Quick prompts</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      className="text-xs"
                    >
                      <prompt.icon className="h-3 w-3 mr-1" />
                      {prompt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Key Concepts */}
              {concepts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">Key concepts from this video</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {concepts.slice(0, 6).map((concept, index) => (
                      <Button
                        key={index}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleQuickPrompt(`Explain "${concept.term}" in more detail`)}
                        className="text-xs"
                      >
                        {concept.term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-indigo-500/10'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-indigo-500" />
                    )}
                  </div>
                  <div className={cn(
                    'flex-1 max-w-[80%] p-3 rounded-lg',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  )}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask a question about the video..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default AITutorChat;
