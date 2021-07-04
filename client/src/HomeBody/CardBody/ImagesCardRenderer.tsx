import React, { useEffect, useState } from 'react';
import { useTrackedState } from '../../selectors/stateContextSelector';
import { useLocation } from 'react-router-dom';
import { If } from '../../util/react-if/If';
import { Then } from '../../util/react-if/Then';
import { loadable } from '../../loadable';
import { createRenderElement } from '../../Layout/MasonryLayout';

const ImagesCard = (condition: boolean, args: { renderImages: string[] }) =>
  loadable({
    importFn: () => import('./ImagesCard').then((module) => createRenderElement(module.default, { ...args })),
    cacheId: 'ImagesCard',
    condition: condition,
    empty: () => <></>,
  });
interface ImagesCardRendererProps {
  index: number;
}

const ImagesCardRenderer: React.FC<ImagesCardRendererProps> = ({ index }) => {
  const [renderImages, setRenderImages] = useState<string[]>([]);
  const [state] = useTrackedState();
  const location = useLocation();

  useEffect(() => {
    let isFinished = false;
    if (location.pathname === '/' && !isFinished) {
      if (Array.isArray(state.imagesData) && state.imagesData.length > 0) {
        const temp = state.imagesMapData.get(index)?.value ?? [];
        if (temp.length > 0 && renderImages.length === 0) {
          setRenderImages(temp);
        }
      }
    }
    return () => {
      isFinished = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.imagesData, state.imagesMapData]);

  // const checkNode = (addedNode: any) => {
  //   if (addedNode.getElementsByTagName === 'function' && addedNode.nodeType === 1 && addedNode.tagName === 'img') {
  //     unrenderImages.current.push(addedNode.src);
  //   }
  // };
  // const observer = useMemo(
  //   () =>
  //     new MutationObserver(function (mutations) {
  //       for (let i = 0; i < mutations.length; i++) {
  //         for (let j = 0; j < mutations[i].addedNodes.length; j++) {
  //           checkNode(mutations[i].addedNodes[j]);
  //         }
  //       }
  //     }),
  //   []
  // );
  // const imgSrcFirstTwo = createRef<HTMLDivElement>();
  // useEffect(() => {
  //   if (imgSrcFirstTwo.current) {
  //     observer.observe(imgSrcFirstTwo.current, {
  //       childList: true,
  //       subtree: true,
  //     });
  //   }
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [imgSrcFirstTwo]);
  return (
    // maxWidth: '100%', maxHeight: '100% to automatically resize the image to fit inside the div
    // _isMounted.current need to be in the IF condition because if not yet mounted,
    // renderImages.length will be the same, thus preventing the images being rendered to
    // ImageMemo since propsAreEqual checker is checking renderImages.length and unrenderImages.length.
    <React.Fragment>
      <If
        condition={
          state.filterBySeen &&
          Array.isArray(state.imagesData) &&
          state.imagesData.length === 0 &&
          renderImages.length === 0
        }
      >
        <Then>
          <div style={{ textAlign: 'center' }}>Loading Images...</div>
        </Then>
      </If>
      {ImagesCard(Array.isArray(state.imagesData) && state.imagesData.length > 0, { renderImages })}
    </React.Fragment>
  );
};
ImagesCardRenderer.displayName = 'ImagesCardRenderer';
export default ImagesCardRenderer;
