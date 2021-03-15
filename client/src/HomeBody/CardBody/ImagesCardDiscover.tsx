import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ImagesCardStyle.scss';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { IState } from '../../typing/interface';
import { isEqualObjects, Loading } from '../../util';
import useCollapse from '../../hooks/useCollapse';
import { ProgressBar } from '../../Layout/ProgressBar';
import { Then } from '../../util/react-if/Then';
import { If } from '../../util/react-if/If';
import ImagesModalLayout from '../../Layout/ImagesModalLayout';
import { ImageComponentLayout } from '../../Layout/ImageComponentLayout';

interface ImagesCardProps {
  index: number;
  visible: boolean;
  state: IState;
}

const ImagesCardDiscover = React.memo<ImagesCardProps>(
  ({ index, visible, state }) => {
    const [renderChildren, setRenderChildren] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [showProgressBarUnRenderImages, setShowProgressBarUnRenderImages] = useState(false);
    const [renderImages, setRenderImages] = useState<string[]>([]);
    const showProgressBarUnRenderImagesRef = useRef<boolean>(true);
    const previousStringUnRenderImages = useRef<string[]>([]);

    let timerToClearSomewhere: any;
    const { getToggleProps, getCollapseProps } = useCollapse({
      defaultExpanded: false, // is the images already expanded in the first place?
      onExpandStart() {
        setRenderChildren(true);
      },
      onCollapseEnd() {
        setRenderChildren(false);
      },
    });

    const handleProgressPromiseUnrender = useCallback((src) => {
      previousStringUnRenderImages.current.push(src); // because ImageComponent will re-render, don't ever set state
      // when rendering. Instead, use useRef
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      let isCancelled = false;
      if (!isCancelled && Array.isArray(state.imagesDataDiscover) && state.imagesDataDiscover.length > 0) {
        const temp = state.imagesDataDiscover.find((obj) => obj.id === index)?.value || [];
        setRenderImages(temp);
      }
      return () => {
        isCancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.imagesDataDiscover]);

    useEffect(() => {
      if (
        (previousStringUnRenderImages.current.length / renderImages.slice(2).length) * 100 >= 100 &&
        showProgressBarUnRenderImages
      ) {
        timerToClearSomewhere = setTimeout(() => {
          setShowProgressBarUnRenderImages(false);
        }, 400);
      }
      return () => {
        clearTimeout(timerToClearSomewhere);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(previousStringUnRenderImages.current.length / renderImages.slice(2).length) * 100]);

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setClicked((prev) => !prev);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleClickUnrenderImages = (e: React.MouseEvent) => {
      e.preventDefault();
      if (showProgressBarUnRenderImagesRef.current) {
        setShowProgressBarUnRenderImages(true);
        showProgressBarUnRenderImagesRef.current = false;
      }
    };
    const imagesCount = useRef(0);
    const loadingCount = useRef(0);
    const [unrenderImages, setUnrenderImages] = useState<string[]>([]);
    const unrenderImagesRef = useRef<string[]>([]);
    useEffect(() => {
      unrenderImagesRef.current = [...unrenderImages]; //shallow copy works because no nested array
    });
    const getImageSrc = useCallback((src) => {
      setUnrenderImages((prevState) => {
        prevState.push(src);
        return prevState;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <React.Fragment>
        <If
          condition={
            state.filterBySeen &&
            Array.isArray(state.imagesDataDiscover) &&
            state.imagesDataDiscover.length === 0 &&
            renderImages.length === 0
          }
        >
          <Then>
            <div style={{ textAlign: 'center' }}>
              <Loading />
            </div>
          </Then>
        </If>
        <If condition={Array.isArray(state.imagesDataDiscover) && state.imagesDataDiscover.length > 0}>
          <Then>
            <If condition={showProgressBarUnRenderImages && renderImages.slice(2).length > 0}>
              <Then>
                <ProgressBar
                  progress={Math.min(
                    100,
                    (previousStringUnRenderImages.current.length / renderImages.slice(2).length) * 100
                  )}
                />
              </Then>
            </If>
            <div style={{ textAlign: 'center' }}>
              {renderImages.length > 0 &&
                renderImages.map((image: string, idx: number) => {
                  return (
                    <ImageComponentLayout
                      handleClick={handleClick}
                      restOfTheImages={false}
                      loadingCount={loadingCount}
                      imagesCount={imagesCount}
                      getImageSrc={getImageSrc}
                      onProgress={handleProgressPromiseUnrender}
                      visible={visible}
                      key={idx}
                      urlLink={image}
                    />
                  );
                })}
            </div>
            <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
              {renderChildren &&
                renderImages.map((image: string, idx: number) => {
                  if (!unrenderImagesRef.current.includes(image)) {
                    return (
                      <ImageComponentLayout
                        handleClick={handleClick}
                        restOfTheImages={true}
                        loadingCount={loadingCount}
                        imagesCount={imagesCount}
                        onProgress={handleProgressPromiseUnrender}
                        visible={visible}
                        key={idx}
                        urlLink={image}
                      />
                    );
                  }
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
        <ImagesModalLayout clicked={clicked} renderImages={renderImages} handleClick={handleClick} />
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.visible, nextProps.visible) &&
      isEqualObjects(prevProps.state.imagesDataDiscover, nextProps.state.imagesDataDiscover) &&
      isEqualObjects(prevProps.index, nextProps.index)
    );
  }
);
ImagesCardDiscover.displayName = 'ImagesCardDiscover';
export default ImagesCardDiscover;
