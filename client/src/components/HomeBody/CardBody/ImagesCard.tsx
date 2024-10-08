import React, { useEffect, useRef, useState } from 'react';
import '../../DiscoverBody/CardDiscoverBody/ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import useCollapse from '../../../hooks/useCollapse';
import Loadable from 'react-loadable';
import { useStableCallback } from '../../../util';
import { useTrackedState } from '../../../selectors/stateContextSelector';
import { useLocation } from 'react-router-dom';
import Empty from '../../Layout/EmptyLayout';
import useDeepCompareEffect from '../../../hooks/useDeepCompareEffect';

const ImageComponentLayout = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ImageComponentLayoutHome" */ '../../Layout/ImageComponentLayout'),
});

const ImagesModalLayout = Loadable({
  loading: Empty,
  delay: 300,
  loader: () => import(/* webpackChunkName: "ImagesModalLayoutHome" */ '../../Layout/ImagesModalLayout'),
});

interface ImagesCard {
  index: number;
}
const ImagesCard: React.FC<ImagesCard> = ({ index }) => {
  const [renderChildren, setRenderChildren] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: false, // is the images already expanded in the first place?
  });

  const handleClickUnrenderImages = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return setRenderChildren((prevState) => !prevState);
  });
  // useRef() is basically useState({current: initialValue })[0] so no need to re-render the component

  const handleClick = useStableCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return setClicked((prev) => !prev);
  });
  const [renderImages, setRenderImages] = useState<Array<{ webP: string; width: number; height: number }>>([]);
  const [state] = useTrackedState();
  const location = useLocation();
  const isFinished = useRef(false);

  useEffect(() => {
    return () => {
      isFinished.current = true;
    };
  }, []);

  useDeepCompareEffect(() => {
    if (location.pathname === '/' && !isFinished.current) {
      if (Array.isArray(state.imagesData) && state.imagesData.length > 0) {
        const temp = state.imagesMapData.get(index)?.value ?? [];
        if (temp.length > 0 && renderImages.length === 0 && !isFinished.current) {
          setRenderImages(temp);
        }
      }
    }
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
    <>
      <div style={{ textAlign: 'center' }}>
        {renderImages.length > 0 &&
          renderImages
            .slice(0, 2)
            .map(
              (image, idx) =>
                image.webP.length > 0 && (
                  <ImageComponentLayout
                    key={idx}
                    urlLink={image.webP}
                    height={image.height}
                    width={image.width}
                    handleClick={handleClick}
                  />
                )
            )}
      </div>
      <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
        {renderChildren &&
          renderImages.slice(2).length > 0 &&
          renderImages
            .slice(2)
            .map(
              (image, idx) =>
                image.webP.length > 0 && (
                  <ImageComponentLayout
                    key={idx}
                    urlLink={image.webP}
                    height={image.height}
                    width={image.width}
                    handleClick={handleClick}
                  />
                )
            )}
      </div>
      {renderImages.slice(2).length > 0 && (
        <ListItem button {...getToggleProps({ onClick: handleClickUnrenderImages })}>
          <ListItemIcon>
            <SupervisorAccountIcon />
          </ListItemIcon>
          <ListItemText primary={`${renderChildren ? 'Hide' : 'Load'} ${renderImages.slice(2).length} More Images`} />
          {renderChildren ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      )}
      {clicked && <ImagesModalLayout clicked={clicked} handleClick={handleClick} renderImages={renderImages} />}
    </>
  );
};
ImagesCard.displayName = 'ImagesCard';
export default ImagesCard;
