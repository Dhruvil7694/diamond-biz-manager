import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Import i18n configuration

// Initialize theme based on user preference or stored preference
const initializeTheme = () => {
  // Check if theme is stored in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // If no saved preference, use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Initialize language based on stored preference or browser language
const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  
  if (savedLanguage === 'en' || savedLanguage === 'gu') {
    document.documentElement.setAttribute('lang', savedLanguage);
  } else {
    // If no saved preference, check browser language
    const browserLang = navigator.language.split('-')[0];
    const lang = browserLang === 'gu' ? 'gu' : 'en';
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('language', lang);
  }
};

// Initialize the theme and language immediately to prevent flash of wrong settings
initializeTheme();
initializeLanguage();

// Ensure the app renders at the correct size initially
document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';
document.getElementById('root')!.style.height = '100%';

// Add event listener for orientation changes to handle mobile rotation
window.addEventListener('orientationchange', () => {
  // Small timeout to ensure the browser has completed the orientation change
  setTimeout(() => {
    // Force layout recalculation
    window.dispatchEvent(new Event('resize'));
  }, 100);
});

createRoot(document.getElementById("root")!).render(<App />);