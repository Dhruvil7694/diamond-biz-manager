import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the viewport breakpoints
export enum Breakpoint {
  MOBILE = 'mobile',       // 0-639px
  TABLET = 'tablet',       // 640px-1023px
  DESKTOP = 'desktop',     // 1024px+
}

interface ViewportContextType {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const defaultContext: ViewportContextType = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
  breakpoint: Breakpoint.DESKTOP,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

const ViewportContext = createContext<ViewportContextType>(defaultContext);

export const useViewport = () => useContext(ViewportContext);

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewport, setViewport] = useState<ViewportContextType>(defaultContext);

  useEffect(() => {
    // Function to determine the current breakpoint
    const getBreakpoint = (width: number): Breakpoint => {
      if (width < 640) return Breakpoint.MOBILE;
      if (width < 1024) return Breakpoint.TABLET;
      return Breakpoint.DESKTOP;
    };

    // Function to update viewport state
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);
      
      setViewport({
        width,
        height,
        breakpoint,
        isMobile: breakpoint === Breakpoint.MOBILE,
        isTablet: breakpoint === Breakpoint.TABLET,
        isDesktop: breakpoint === Breakpoint.DESKTOP,
      });
    };

    // Initialize with current dimensions
    updateViewport();

    // Add event listener for window resize
    window.addEventListener('resize', updateViewport);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};