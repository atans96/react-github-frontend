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
import SliderImage from './SliderImage';
import { useClickOutside } from '../../hooks/hooks';
import useDeepCompareEffect from '../../hooks/useDeepCompareEffect';
import ImagesModalLayout from '../../Layout/ImagesModalLayout';
import { ImageComponentLayout } from '../../Layout/ImageComponentLayout';

interface ImagesCardProps {
  index: string;
  visible: boolean;
  state: IState;
}

const ImagesCard = React.memo<ImagesCardProps>(
  ({ index, visible, state }) => {
    const [renderChildren, setRenderChildren] = useState(false);
    const [modal, setModal] = useState(false);
    const [Visible, setVisible] = useState(false);
    const [showProgressBarUnRenderImages, setShowProgressBarUnRenderImages] = useState(false);
    const [renderImages, setRenderImages] = useState<string[]>([]);
    const showProgressBarUnRenderImagesRef = useRef<boolean>(true);
    const previousStringUnRenderImages = useRef<string[]>([]);
    const sliderInner = useRef<HTMLDivElement | null>(null);
    const sliderContainer = useRef<HTMLDivElement | null>(null);

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

    // when visible props changes, ImagesCard will re-render, thus causing unmount to execute.
    useEffect(() => {
      let isCancelled = false;
      if (!isCancelled && visible && !Visible) {
        setVisible(visible);
      }
      return () => {
        isCancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useDeepCompareEffect(() => {
      let isCancelled = false;
      if (
        !isCancelled &&
        Array.isArray(state.imagesData) &&
        state.imagesData.length > 0 &&
        state.imagesData.find((obj) => obj.id === index)?.value.length !== undefined
      ) {
        setRenderImages(state.imagesData.find((obj) => obj.id === index).value);
      }
      return () => {
        isCancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.imagesData]);

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
    }, [(previousStringUnRenderImages.current.length / renderImages.slice(2).length) * 100]);

    useEffect(() => {
      if (sliderContainer.current && sliderInner.current) {
        const slider = new SliderImage({
          slider: sliderContainer.current,
          sliderInner: sliderInner.current,
          slide: sliderInner.current.querySelectorAll('.slide'),
        });
        slider.init();
        return () => {
          sliderContainer.current = null;
          sliderInner.current = null;
          sliderInner.current = null;
          slider.destroy();
        };
      }
    }, [sliderContainer.current, sliderInner.current]);

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setModal(true);
    }, []);
    const handleClickUnrenderImages = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (showProgressBarUnRenderImagesRef.current) {
          setShowProgressBarUnRenderImages(true);
          showProgressBarUnRenderImagesRef.current = false;
        }
      },
      [showProgressBarUnRenderImagesRef.current]
    );
    useClickOutside(sliderContainer, () => setModal(false));
    // useRef() is basically useState({current: initialValue })[0] so no need to re-render the component
    // TODO: animated card for showing users suggested gits: https://codyhouse.co/ds/components/app/animated-cards

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
              <Loading />
            </div>
          </Then>
        </If>
        <If condition={Array.isArray(state.imagesData) && state.imagesData.length > 0 && renderImages.length > 0}>
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
                renderImages.slice(0, 2).map((image: string, idx: number) => {
                  return (
                    <div key={idx}>
                      <ImageComponentLayout
                        handleClick={handleClick}
                        onProgress={handleProgressPromiseUnrender}
                        visible={visible}
                        urlLink={image}
                      />
                    </div>
                  );
                })}
            </div>
            <If condition={renderImages.slice(2).length > 0}>
              <Then>
                <div {...getCollapseProps({ style: { textAlign: 'center' } })}>
                  {renderChildren &&
                    renderImages.slice(2).map((image: string, idx: number) => {
                      return (
                        <div key={idx}>
                          <ImageComponentLayout
                            handleClick={handleClick}
                            onProgress={handleProgressPromiseUnrender}
                            visible={visible}
                            urlLink={image}
                          />
                        </div>
                      );
                    })}
                </div>
                <ListItem button {...getToggleProps({ onClick: handleClickUnrenderImages })}>
                  <ListItemIcon>
                    <SupervisorAccountIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${renderChildren ? 'Hide' : 'Load'} ${renderImages.slice(2).length} More Images`}
                  />
                  {renderChildren ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
              </Then>
            </If>
          </Then>
        </If>
        <ImagesModalLayout
          handleClick={handleClick}
          handleProgressPromiseUnrender={handleProgressPromiseUnrender}
          modal={modal}
          Visible={Visible}
          renderImages={renderImages}
        />
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.visible, nextProps.visible) &&
      isEqualObjects(prevProps.state.imagesData, nextProps.state.imagesData)
    );
  }
);
export default ImagesCard;
