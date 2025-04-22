import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'default',
  className 
}) => {
  const { t } = useTranslation();
  const { language, setLanguage, availableLanguages } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'en' | 'gu');
  };

  if (variant === 'minimal') {
    return (
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className={cn("w-[70px]", className)}>
          <SelectValue placeholder={language.toUpperCase()} />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.code.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <label className="text-sm font-medium">
        {t('common.language')}
      </label>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={language === 'en' ? 'English' : 'ગુજરાતી'} />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;