import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Check, Moon, Save, Sun, SunMoon } from 'lucide-react';

// Define theme interface
interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  denseMode: boolean;
  highContrast: boolean;
  animations: boolean;
  sidebarCollapsed: boolean;
}

const AppearanceSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize with default values
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    fontSize: 'medium',
    denseMode: false,
    highContrast: false,
    animations: true,
    sidebarCollapsed: false,
  });

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearanceSettings');
    if (savedAppearance) {
      try {
        setAppearance(JSON.parse(savedAppearance));
        applyTheme(JSON.parse(savedAppearance).theme);
        applyFontSize(JSON.parse(savedAppearance).fontSize);
      } catch (error) {
        console.error('Failed to parse saved appearance settings', error);
      }
    }
  }, []);

  // Apply theme to document
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  };

  // Apply font size
  const applyFontSize = (size: 'small' | 'medium' | 'large') => {
    document.documentElement.dataset.fontSize = size;
    // Apply different root font sizes based on selection
    switch (size) {
      case 'small':
        document.documentElement.style.fontSize = '14px';
        break;
      case 'medium':
        document.documentElement.style.fontSize = '16px';
        break;
      case 'large':
        document.documentElement.style.fontSize = '18px';
        break;
    }
  };

  // Handle theme change
  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setAppearance(prev => ({ ...prev, theme: value }));
    applyTheme(value);
  };

  // Handle font size change
  const handleFontSizeChange = (value: 'small' | 'medium' | 'large') => {
    setAppearance(prev => ({ ...prev, fontSize: value }));
    applyFontSize(value);
  };

  // Handle toggle switches
  const handleToggleChange = (key: keyof AppearanceSettings) => {
    setAppearance(prev => {
      const updatedSettings = { ...prev, [key]: !prev[key] };
      
      // If we're toggling animations, apply it immediately
      if (key === 'animations') {
        document.documentElement.classList.toggle('reduce-motion', !updatedSettings.animations);
      }
      
      // If we're toggling high contrast, apply it immediately
      if (key === 'highContrast') {
        document.documentElement.classList.toggle('high-contrast', updatedSettings.highContrast);
      }
      
      return updatedSettings;
    });
  };
  
  const saveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage for persistence
      localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
      
      // Simulate API call to save to server
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Appearance Settings Saved",
        description: "Your display preferences have been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to Save",
        description: "There was a problem saving your appearance settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetToDefaults = () => {
    const defaultSettings: AppearanceSettings = {
      theme: 'system',
      fontSize: 'medium',
      denseMode: false,
      highContrast: false,
      animations: true,
      sidebarCollapsed: false,
    };
    
    setAppearance(defaultSettings);
    applyTheme(defaultSettings.theme);
    applyFontSize(defaultSettings.fontSize);
    
    document.documentElement.classList.remove('reduce-motion', 'high-contrast');
    
    toast({
      title: "Reset to Defaults",
      description: "Appearance settings have been reset to default values.",
      variant: "default",
    });
  };

  // Theme option components for visual selection
  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-5 w-5" />,
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="h-5 w-5" />,
    },
    {
      value: 'system',
      label: 'System',
      icon: <SunMoon className="h-5 w-5" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <div
                key={option.value}
                className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${
                  appearance.theme === option.value 
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'system')}
              >
                <div className="mb-2">{option.icon}</div>
                <span className="text-sm">{option.label}</span>
                {appearance.theme === option.value && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Font Size */}
        <div className="space-y-2">
          <Label htmlFor="fontSize">Font Size</Label>
          <Select 
            value={appearance.fontSize} 
            onValueChange={(value) => handleFontSizeChange(value as 'small' | 'medium' | 'large')}
          >
            <SelectTrigger id="fontSize">
              <SelectValue placeholder="Select a font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Changes the base font size of the application.
          </p>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Display Options</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="denseMode" className="flex-1">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Reduces spacing and padding for denser UI
                </p>
              </div>
              <Switch 
                id="denseMode" 
                checked={appearance.denseMode}
                onCheckedChange={() => handleToggleChange('denseMode')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="highContrast" className="flex-1">High Contrast</Label>
                <p className="text-xs text-muted-foreground">
                  Increases contrast for better readability
                </p>
              </div>
              <Switch 
                id="highContrast" 
                checked={appearance.highContrast}
                onCheckedChange={() => handleToggleChange('highContrast')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations" className="flex-1">UI Animations</Label>
                <p className="text-xs text-muted-foreground">
                  Enable/disable UI transition animations
                </p>
              </div>
              <Switch 
                id="animations" 
                checked={appearance.animations}
                onCheckedChange={() => handleToggleChange('animations')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sidebarCollapsed" className="flex-1">Collapsed Sidebar</Label>
                <p className="text-xs text-muted-foreground">
                  Start with the sidebar in collapsed state
                </p>
              </div>
              <Switch 
                id="sidebarCollapsed" 
                checked={appearance.sidebarCollapsed}
                onCheckedChange={() => handleToggleChange('sidebarCollapsed')}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          disabled={isLoading}
        >
          Reset to Defaults
        </Button>
        <Button 
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Apply Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppearanceSettings;