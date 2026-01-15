// Quiz Component
// Interactive quiz with multiple question types, scoring, and explanations

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ClipboardList, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  Trophy,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { useQuiz } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface QuizComponentProps {
  transcript: string;
  videoTitle?: string;
}

export function QuizComponent({ transcript, videoTitle }: QuizComponentProps) {
  const { 
    generate, 
    isLoading, 
    error, 
    questions, 
    state, 
    answer,
    nextQuestion,
    prevQuestion,
    submit,
    reset 
  } = useQuiz();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');

  const currentQuestion = questions[state.currentQuestion];

  const handleGenerate = async () => {
    await generate(transcript, 10, selectedDifficulty, videoTitle);
    setShowExplanation(null);
  };

  const handleAnswer = (questionId: string, userAnswer: string) => {
    answer(questionId, userAnswer);
    if (currentQuestion?.type === 'fill-blank') {
      setFillBlankAnswer('');
    }
  };

  const handleSubmit = () => {
    submit();
  };

  const handleReset = () => {
    reset();
    setShowExplanation(null);
    setFillBlankAnswer('');
  };

  const isAnswered = currentQuestion && state.answers[currentQuestion.id];
  const isCorrect = currentQuestion && 
    state.answers[currentQuestion.id]?.toLowerCase().trim() === 
    currentQuestion.correctAnswer.toLowerCase().trim();

  const getScoreMessage = () => {
    const percentage = (state.score / questions.length) * 100;
    if (percentage >= 90) return { emoji: '🏆', message: 'Excellent!' };
    if (percentage >= 70) return { emoji: '🎉', message: 'Great job!' };
    if (percentage >= 50) return { emoji: '👍', message: 'Good effort!' };
    return { emoji: '📚', message: 'Keep studying!' };
  };

  if (!transcript) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Transcribe the video first to generate a quiz.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-500" />
            Quiz
          </CardTitle>
          {questions.length > 0 && !state.completed && (
            <span className="text-sm text-muted-foreground">
              {Object.keys(state.answers).length} / {questions.length} answered
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate Options */}
        {questions.length === 0 && !isLoading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard', 'mixed'] as const).map((diff) => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                    className="capitalize"
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} className="w-full" size="lg">
              <ClipboardList className="h-4 w-4 mr-2" />
              Generate Quiz
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Creating quiz questions...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Quiz Completed */}
        {state.completed && (
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl">{getScoreMessage().emoji}</div>
            <h3 className="text-2xl font-bold">{getScoreMessage().message}</h3>
            <p className="text-lg">
              You scored <span className="font-bold text-primary">{state.score}</span> out of{' '}
              <span className="font-bold">{questions.length}</span>
            </p>
            <Progress value={(state.score / questions.length) * 100} className="h-3" />
            <p className="text-muted-foreground">
              {Math.round((state.score / questions.length) * 100)}% correct
            </p>
            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => { reset(); handleGenerate(); }}>
                New Quiz
              </Button>
            </div>
          </div>
        )}

        {/* Active Question */}
        {questions.length > 0 && !state.completed && currentQuestion && (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {state.currentQuestion + 1} of {questions.length}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  currentQuestion.difficulty === 'easy' && 'bg-green-500/10 text-green-600',
                  currentQuestion.difficulty === 'medium' && 'bg-yellow-500/10 text-yellow-600',
                  currentQuestion.difficulty === 'hard' && 'bg-red-500/10 text-red-600'
                )}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <Progress value={(state.currentQuestion + 1) / questions.length * 100} />
            </div>

            {/* Question */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-lg">{currentQuestion.question}</p>
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {/* Multiple Choice */}
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = state.answers[currentQuestion.id] === option;
                    const isCorrectOption = option.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        disabled={isAnswered !== undefined}
                        className={cn(
                          'w-full p-3 text-left rounded-lg border-2 transition-colors',
                          'hover:border-primary hover:bg-primary/5',
                          isSelected && !isAnswered && 'border-primary bg-primary/10',
                          isAnswered && isSelected && isCorrectOption && 'border-green-500 bg-green-500/10',
                          isAnswered && isSelected && !isCorrectOption && 'border-red-500 bg-red-500/10',
                          isAnswered && !isSelected && isCorrectOption && 'border-green-500 bg-green-500/10',
                          isAnswered && 'cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isAnswered && isCorrectOption && <Check className="h-4 w-4 text-green-600" />}
                          {isAnswered && isSelected && !isCorrectOption && <X className="h-4 w-4 text-red-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type === 'true-false' && (
                <div className="flex gap-2">
                  {['True', 'False'].map((option) => {
                    const isSelected = state.answers[currentQuestion.id] === option;
                    const isCorrectOption = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        disabled={isAnswered !== undefined}
                        className={cn(
                          'flex-1 p-4 rounded-lg border-2 font-medium transition-colors',
                          'hover:border-primary hover:bg-primary/5',
                          isSelected && !isAnswered && 'border-primary bg-primary/10',
                          isAnswered && isSelected && isCorrectOption && 'border-green-500 bg-green-500/10',
                          isAnswered && isSelected && !isCorrectOption && 'border-red-500 bg-red-500/10',
                          isAnswered && !isSelected && isCorrectOption && 'border-green-500 bg-green-500/10',
                          isAnswered && 'cursor-not-allowed'
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the Blank */}
              {currentQuestion.type === 'fill-blank' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Type your answer..."
                    value={fillBlankAnswer}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    disabled={isAnswered !== undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && fillBlankAnswer.trim()) {
                        handleAnswer(currentQuestion.id, fillBlankAnswer);
                      }
                    }}
                  />
                  {!isAnswered && (
                    <Button 
                      onClick={() => handleAnswer(currentQuestion.id, fillBlankAnswer)}
                      disabled={!fillBlankAnswer.trim()}
                    >
                      Submit Answer
                    </Button>
                  )}
                  {isAnswered && (
                    <div className={cn(
                      'p-3 rounded-lg',
                      isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    )}>
                      {isCorrect ? (
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4" /> Correct!
                        </span>
                      ) : (
                        <span>
                          Correct answer: <strong>{currentQuestion.correctAnswer}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <Button
                variant="ghost"
                onClick={() => setShowExplanation(
                  showExplanation === currentQuestion.id ? null : currentQuestion.id
                )}
                className="w-full"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {showExplanation === currentQuestion.id ? 'Hide' : 'Show'} Explanation
              </Button>
            )}
            {showExplanation === currentQuestion.id && (
              <div className="p-4 bg-primary/10 rounded-lg text-sm">
                {currentQuestion.explanation}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={state.currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {state.currentQuestion === questions.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={Object.keys(state.answers).length < questions.length}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => { nextQuestion(); setShowExplanation(null); }}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default QuizComponent;
