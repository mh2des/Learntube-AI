'use client';

import Link from 'next/link';
import { Menu, Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

// Logo component - Premium wordmark with icon
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark - stylized play/learn symbol */}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4.5 w-4.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized play triangle merged with learning path */}
          <path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" />
        </svg>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-[10px] bg-primary/20 blur-md -z-10" />
      </div>
      
      {/* Wordmark */}
      <span className="font-heading text-lg font-semibold tracking-tight">
        LearnTube
        <span className="text-primary">AI</span>
      </span>
    </div>
  );
}

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Track scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header 
      className={`
        sticky top-0 z-50 w-full transition-all duration-300 ease-out
        ${scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' 
          : 'bg-transparent border-b border-transparent'
        }
      `}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/learn"
            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
          >
            Start Learning
          </Link>
          <Link
            href="/#features"
            className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
          >
            Pricing
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-[10px]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* CTA Button - Desktop */}
          <Button 
            asChild
            size="sm" 
            className="hidden md:inline-flex gap-1.5"
          >
            <Link href="/learn">
              <Sparkles className="h-3.5 w-3.5" />
              Get Started
            </Link>
          </Button>

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[10px]">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[12px] p-2">
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href="/learn" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Start Learning
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href="/#features">Features</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg">
                <Link href="/#pricing">Pricing</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
