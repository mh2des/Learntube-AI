// Translation Panel - AI-powered subtitle translation using Gemini
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Languages, 
  Loader2, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Sparkles,
  FileText,
  X
} from 'lucide-react';

// Available languages for translation
const TRANSLATION_LANGUAGES: Record<string, string> = {
  'ar': 'Arabic',
  'zh': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)', 
  'cs': 'Czech',
  'nl': 'Dutch',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
  'el': 'Greek',
  'hi': 'Hindi',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pt-BR': 'Portuguese (Brazil)',
  'ru': 'Russian',
  'es': 'Spanish',
  'es-419': 'Spanish (Latin America)',
  'sv': 'Swedish',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
};

interface TranslatedFile {
  languageCode: string;
  languageName: string;
  content: string;
  segmentCount: number;
}

interface TranslationPanelProps {
  transcript: string;
  sourceLanguage?: string;
  videoTitle?: string;
  onTranslationComplete?: (translations: TranslatedFile[]) => void;
}

export function TranslationPanel({
  transcript,
  sourceLanguage,
  videoTitle,
  onTranslationComplete,
}: TranslationPanelProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set());
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [translations, setTranslations] = useState<TranslatedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter out the source language from available options
  const availableLanguages = Object.entries(TRANSLATION_LANGUAGES).filter(
    ([code]) => code !== sourceLanguage
  );

  // Toggle language selection
  const toggleLanguage = (code: string) => {
    const newSelected = new Set(selectedLanguages);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedLanguages(newSelected);
  };

  // Select/deselect all
  const toggleAll = () => {
    if (selectedLanguages.size === availableLanguages.length) {
      setSelectedLanguages(new Set());
    } else {
      setSelectedLanguages(new Set(availableLanguages.map(([code]) => code)));
    }
  };

  // Quick select popular languages
  const selectPopular = () => {
    const popular = ['es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'ru'];
    setSelectedLanguages(new Set(popular.filter(code => code !== sourceLanguage)));
  };

  // Translate to selected languages
  const handleTranslate = useCallback(async () => {
    if (selectedLanguages.size === 0 || !transcript) return;

    setIsTranslating(true);
    setError(null);
    setTranslations([]);
    const languages = Array.from(selectedLanguages);
    setProgress({ current: 0, total: languages.length });

    const newTranslations: TranslatedFile[] = [];

    for (let i = 0; i < languages.length; i++) {
      const langCode = languages[i];
      const langName = TRANSLATION_LANGUAGES[langCode];
      setCurrentLanguage(langName);
      setProgress({ current: i, total: languages.length });

      try {
        const response = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: transcript,
            targetLanguage: langCode,
            sourceLanguage,
            videoTitle,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Translation failed');
        }

        const result = await response.json();
        
        newTranslations.push({
          languageCode: langCode,
          languageName: langName,
          content: result.data.translatedContent,
          segmentCount: result.data.segmentCount,
        });

        // Update state progressively
        setTranslations([...newTranslations]);
      } catch (err) {
        console.error(`Failed to translate to ${langName}:`, err);
        // Continue with other languages
      }
    }

    setProgress({ current: languages.length, total: languages.length });
    setCurrentLanguage(null);
    setIsTranslating(false);

    if (newTranslations.length === 0) {
      setError('All translations failed. Please try again.');
    } else if (onTranslationComplete) {
      onTranslationComplete(newTranslations);
    }
  }, [selectedLanguages, transcript, sourceLanguage, videoTitle, onTranslationComplete]);

  // Download a single translation as VTT file
  const downloadTranslation = (translation: TranslatedFile) => {
    const blob = new Blob([translation.content], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = videoTitle?.replace(/[^a-z0-9]/gi, '_').slice(0, 50) || 'transcript';
    a.href = url;
    a.download = `${safeTitle}.${translation.languageCode}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all translations as a zip (simple concatenation for now)
  const downloadAll = () => {
    translations.forEach(t => downloadTranslation(t));
  };

  // Check if transcript is available
  if (!transcript) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Languages className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Load a transcript first to enable translation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          AI Translation
          <span className="text-xs font-normal text-muted-foreground ml-2">
            Powered by Gemini
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>
            Source: {sourceLanguage ? TRANSLATION_LANGUAGES[sourceLanguage] || sourceLanguage : 'Auto-detect'}
          </span>
        </div>

        {/* Language Selection */}
        {!isTranslating && translations.length === 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Select target languages ({selectedLanguages.size} selected)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectPopular}>
                  Popular 10
                </Button>
                <Button variant="outline" size="sm" onClick={toggleAll}>
                  {selectedLanguages.size === availableLanguages.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
              {availableLanguages.map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => toggleLanguage(code)}
                  className={`px-3 py-2 rounded-md text-sm text-left transition-colors ${
                    selectedLanguages.has(code)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Translate Button */}
            <Button
              onClick={handleTranslate}
              disabled={selectedLanguages.size === 0}
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Translate to {selectedLanguages.size} Language{selectedLanguages.size !== 1 ? 's' : ''}
            </Button>
          </>
        )}

        {/* Progress */}
        {isTranslating && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Translating to {currentLanguage}...</p>
                <p className="text-sm text-muted-foreground">
                  {progress.current + 1} of {progress.total} languages
                </p>
              </div>
            </div>
            <Progress value={((progress.current + 1) / progress.total) * 100} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {translations.length > 0 && !isTranslating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  {translations.length} translation{translations.length !== 1 ? 's' : ''} complete!
                </span>
              </div>
              {translations.length > 1 && (
                <Button variant="outline" size="sm" onClick={downloadAll}>
                  <Download className="h-4 w-4 mr-1" />
                  Download All
                </Button>
              )}
            </div>

            {/* Translation List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {translations.map((t) => (
                <div
                  key={t.languageCode}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{t.languageName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.segmentCount} segments
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => downloadTranslation(t)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setTranslations([]);
                setSelectedLanguages(new Set());
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Translate More Languages
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
