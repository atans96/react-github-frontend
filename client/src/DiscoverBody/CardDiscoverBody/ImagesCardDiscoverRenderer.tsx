import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { loadable } from '../../loadable';
import { createRenderElement } from '../../Layout/MasonryLayout';

const ImagesCardDiscover = (
  condition: boolean,
  args: {
    renderImages: string[];
    index: number;
    imagesMapDataDiscover: Map<number, any>;
    setRenderImages: React.Dispatch<React.SetStateAction<string[]>>;
  }
) =>
  loadable({
    importFn: () => import('./ImagesCardDiscover').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'ImagesCardDiscover',
    condition: condition,
    empty: () => <></>,
  });
interface ImagesCardProps {
  index: number;
  imagesMapDataDiscover: Map<number, any>;
}

const ImagesCardDiscoverRenderer: React.FC<ImagesCardProps> = ({ index, imagesMapDataDiscover }) => {
  const [renderImages, setRenderImages] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    let isCancelled = false;
    if (location.pathname === '/discover' && !isCancelled && imagesMapDataDiscover.size > 0) {
      const temp = imagesMapDataDiscover.get(index)?.value ?? [];
      setRenderImages(temp);
      return () => {
        isCancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesMapDataDiscover]);

  return (
    <React.Fragment>
      <If condition={imagesMapDataDiscover.size === 0 && renderImages.length === 0}>
        <Then>
          <div style={{ textAlign: 'center' }}>Loading Images...</div>
        </Then>
      </If>
      {ImagesCardDiscover(imagesMapDataDiscover.size > 0, {
        index,
        imagesMapDataDiscover,
        renderImages,
        setRenderImages,
      })}
    </React.Fragment>
  );
};
ImagesCardDiscoverRenderer.displayName = 'ImagesCardDiscoverRenderer';
export default ImagesCardDiscoverRenderer;
