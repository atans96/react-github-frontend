import { useEffect } from 'react';

let scrollLocation = 0;
export const useScrollSaver = (location: string) => {
  useEffect(() => {
    if (scrollLocation > 0) {
      window.scrollTo(0, scrollLocation);
    }
    const handleScroll = () => {
      scrollLocation = window.pageYOffset;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
};
