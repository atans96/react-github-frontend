import { useEffect, useState } from 'react';

export const useScrollSaver = (pathname: string, path: string) => {
  const [scrollSaver, setScrollSaver] = useState(window.pageYOffset);
  useEffect(() => {
    if (pathname === path) {
      window.scrollTo(0, scrollSaver);
    } else {
      setScrollSaver(window.pageYOffset);
    }
  }, [pathname]);
};
