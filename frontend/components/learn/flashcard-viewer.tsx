// Flashcard Viewer Component
// Interactive flashcards with flip animation and study mode

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Layers, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  Shuffle,
  Eye,
  EyeOff,
  Download,
  Check,
  X
} from 'lucide-react';
import { useFlashcards } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface FlashcardViewerProps {
  transcript: string;
  videoTitle?: string;
}

export function FlashcardViewer({ transcript, videoTitle }: FlashcardViewerProps) {
  const { 
    generate, 
    isLoading, 
    error, 
    flashcards, 
    currentIndex, 
    setCurrentIndex,
    next, 
    prev, 
    shuffle, 
    reset 
  } = useFlashcards();
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());

  const currentCard = flashcards[currentIndex];

  const handleGenerate = async () => {
    await generate(transcript, 15, videoTitle);
    setKnown(new Set());
    setUnknown(new Set());
    setIsFlipped(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    next();
  };

  const handlePrev = () => {
    setIsFlipped(false);
    prev();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    shuffle();
  };

  const markKnown = () => {
    if (currentCard) {
      setKnown(prev => new Set(prev).add(currentCard.id));
      setUnknown(prev => {
        const next = new Set(prev);
        next.delete(currentCard.id);
        return next;
      });
    }
    handleNext();
  };

  const markUnknown = () => {
    if (currentCard) {
      setUnknown(prev => new Set(prev).add(currentCard.id));
      setKnown(prev => {
        const next = new Set(prev);
        next.delete(currentCard.id);
        return next;
      });
    }
    handleNext();
  };

  const exportToAnki = () => {
    const ankiFormat = flashcards
      .map(card => `${card.front}\t${card.back}`)
      .join('\n');
    const blob = new Blob([ankiFormat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards-anki.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      case 'hard': return 'bg-red-500/10 text-red-600';
      default: return 'bg-muted';
    }
  };

  if (!transcript) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Transcribe the video first to generate flashcards.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Flashcards
          </CardTitle>
          <div className="flex items-center gap-2">
            {flashcards.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAll(!showAll)}
                  title={showAll ? 'Card view' : 'List view'}
                >
                  {showAll ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={exportToAnki}
                  title="Export to Anki"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate Button */}
        {flashcards.length === 0 && !isLoading && (
          <Button onClick={handleGenerate} className="w-full" size="lg">
            <Layers className="h-4 w-4 mr-2" />
            Generate Flashcards
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Creating flashcards...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* List View */}
        {flashcards.length > 0 && showAll && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {flashcards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowAll(false);
                  setIsFlipped(false);
                }}
                className={cn(
                  'p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors',
                  known.has(card.id) && 'border-green-500 bg-green-500/5',
                  unknown.has(card.id) && 'border-red-500 bg-red-500/5'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{card.front}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.back}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getDifficultyColor(card.difficulty)
                  )}>
                    {card.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card View */}
        {flashcards.length > 0 && !showAll && currentCard && (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Card {currentIndex + 1} of {flashcards.length}</span>
                <span>
                  <span className="text-green-600">{known.size} known</span>
                  {' • '}
                  <span className="text-red-600">{unknown.size} review</span>
                </span>
              </div>
              <Progress value={(currentIndex + 1) / flashcards.length * 100} />
            </div>

            {/* Flashcard */}
            <div 
              className="perspective-1000 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={cn(
                'relative w-full h-64 transition-transform duration-500 transform-style-3d',
                isFlipped && 'rotate-y-180'
              )}>
                {/* Front */}
                <div className={cn(
                  'absolute inset-0 backface-hidden',
                  'border-2 rounded-xl p-6 flex flex-col items-center justify-center',
                  'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950',
                  isFlipped && 'invisible'
                )}>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full mb-4',
                    getDifficultyColor(currentCard.difficulty)
                  )}>
                    {currentCard.difficulty} • {currentCard.type}
                  </span>
                  <p className="text-lg font-medium text-center">
                    {currentCard.front}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Click to reveal answer
                  </p>
                </div>

                {/* Back */}
                <div className={cn(
                  'absolute inset-0 backface-hidden rotate-y-180',
                  'border-2 rounded-xl p-6 flex flex-col items-center justify-center',
                  'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
                  !isFlipped && 'invisible'
                )}>
                  <p className="text-lg text-center">
                    {currentCard.back}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShuffle} title="Shuffle">
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => { reset(); handleGenerate(); }} title="Regenerate">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markUnknown}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Review
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markKnown}
                  className="text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Know it
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default FlashcardViewer;
