import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import useImage from '../../hooks/useImage';
import SliderImage from './SliderImage';
import { useClickOutside } from '../../hooks/hooks';
import { LoadingSmall } from '../LoadingSmall';

interface ImagesModalLayoutProps {
  clicked: boolean;
  renderImages: Array<{ webP: string; width: number; height: number }>;
  ref?: any;
  handleClick: (args: any) => void;
}

interface ImageComponentProps {
  urlLink: string;
  loader?: JSX.Element;
}

const ImageModal: React.FC<ImageComponentProps> = ({ urlLink }) => {
  const { isLoading, error, height, width } = useImage({
    srcList: urlLink,
    useSuspense: false,
  });
  if (!isLoading && height && width) {
    if (height > 193 && width > 64) {
      return (
        <div className={'slide'}>
          <img src={error === null ? urlLink : ''} className={'images'} alt="" />
        </div>
      );
    }
  }
  return <></>;
};
const ImagesModalLayout: React.FC<ImagesModalLayoutProps> = ({ handleClick, clicked, renderImages }) => {
  const [mouseGrabbing, setMouseGrabbing] = useState(false);
  const sliderInner = useRef<HTMLDivElement | null>(null);
  const sliderContainer = useRef<HTMLDivElement | null>(null);
  useClickOutside(sliderContainer, (e: any) => handleClick(e));
  const [render, setRender] = useState(false);

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
        slider.destroy();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  useEffect(() => {
    setRender(!render); //if not re-render, sliderContainer.current will still be null after spawning modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clicked]);
  return (
    <Modal open={clicked}>
      <React.Fragment>
        <div className="slide-close-button">
          <CloseIcon style={{ display: 'block', margin: 'auto', transform: 'scale(3.5)' }} />
        </div>
        <div
          ref={sliderContainer}
          className={clsx('slides', {
            grabbing: mouseGrabbing,
          })}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMouseGrabbing(true);
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMouseGrabbing(false);
          }}
        >
          <div className={'slides-inner'} ref={sliderInner}>
            {renderImages.map((image, idx: number) => (
              <ImageModal urlLink={image.webP} loader={<LoadingSmall />} key={idx} />
            ))}
          </div>
        </div>
      </React.Fragment>
    </Modal>
  );
};
ImagesModalLayout.displayName = 'ImagesModalLayout';
export default ImagesModalLayout;
