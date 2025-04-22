import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils'; // assuming you're using a classnames utility
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme, isDarkMode } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full hover:bg-white/10 dark:hover:bg-white/10 transition-colors duration-200"
          >
            <span className="sr-only">Toggle theme</span>
            {isDarkMode ? (
              <Moon className="h-5 w-5 text-yellow-300" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change Theme</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn('flex items-center gap-2', theme === 'light' && 'bg-muted')}
        >
          <Sun className="h-4 w-4 text-yellow-500" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn('flex items-center gap-2', theme === 'dark' && 'bg-muted')}
        >
          <Moon className="h-4 w-4 text-purple-400" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn('flex items-center gap-2', theme === 'system' && 'bg-muted')}
        >
          <Monitor className="h-4 w-4 text-blue-400" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
