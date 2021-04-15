import React, { useCallback, useEffect, useState } from 'react';
import '../../DiscoverBody/CardDiscoverBody/ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { isEqualObjects } from '../../util';
import useCollapse from '../../hooks/useCollapse';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';
import ImagesModalLayout from '../../Layout/ImagesModalLayout';
import { ImageComponentLayout } from '../../Layout/ImageComponentLayout';
import { useLocation } from 'react-router-dom';
import { useTrackedState } from '../../selectors/stateContextSelector';
import {createRenderElement} from "../../Layout/MasonryLayout";
import TopicsCard from "./TopicsCard";

interface ImagesCardProps {
  index: number;
  visible: boolean;
}

const ImagesCard = React.memo<ImagesCardProps>(
  ({ index, visible }) => {
    const [renderChildren, setRenderChildren] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [renderImages, setRenderImages] = useState<string[]>([]);
    const [state] = useTrackedState();
    const { getToggleProps, getCollapseProps } = useCollapse({
      defaultExpanded: false, // is the images already expanded in the first place?
    });
    const location = useLocation();

    useEffect(() => {
      let isFinished = false;
      if (location.pathname === '/' && !isFinished) {
        if (Array.isArray(state.imagesData) && state.imagesData.length > 0) {
          const temp = state.imagesMapData.get(index)?.value ?? [];
          setRenderImages(temp);
        }
      }
      return () => {
        isFinished = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.imagesData, state.imagesMapData]);

    const handleClickUnrenderImages = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setRenderChildren((prevState) => !prevState);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // useRef() is basically useState({current: initialValue })[0] so no need to re-render the component

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setClicked((prev) => !prev);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
            <div style={{ textAlign: 'center' }}>
              Loading Images...
            </div>
          </Then>
        </If>
        <If condition={Array.isArray(state.imagesData) && state.imagesData.length > 0}>
          <Then>
            <div style={{ textAlign: 'center' }}>
              {renderImages.length > 0 &&
                renderImages.slice(0, 2).map((image: string) => {
                  return (
                      createRenderElement(ImageComponentLayout, {handleClick: handleClick, visible: visible, key: image, urlLink: image})
                  );
                })}
            </div>
            <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
              {renderChildren &&
                renderImages.length > 0 &&
                renderImages.slice(2).map((image: string) => {
                  return (
                      createRenderElement(ImageComponentLayout, {handleClick: handleClick, visible: visible, key: image, urlLink: image})
                  );
                })}
            </div>
            <ListItem button {...getToggleProps({ onClick: handleClickUnrenderImages })}>
              <ListItemIcon>
                <SupervisorAccountIcon />
              </ListItemIcon>
              <ListItemText primary={`${renderChildren ? 'Hide' : 'Load'} ${renderImages.length} More Images`} />
              {renderChildren ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
          </Then>
        </If>
          {createRenderElement(ImagesModalLayout, {
              clicked: clicked,
              renderImages: renderImages,
              handleClick: handleClick
          })}
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return isEqualObjects(prevProps.visible, nextProps.visible);
  }
);
ImagesCard.displayName = 'ImagesCard';
export default ImagesCard;
