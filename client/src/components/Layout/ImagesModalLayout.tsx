import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import SliderImage from './SliderImage';
import { useOuterClick } from '../../hooks/hooks';

interface ImagesModalLayoutProps {
  clicked: boolean;
  renderImages: Array<{ webP: string; width: number; height: number }>;
  ref?: any;
  handleClick: (args: any) => void;
}

const ImagesModalLayout: React.FC<ImagesModalLayoutProps> = ({ handleClick, clicked, renderImages }) => {
  const [mouseGrabbing, setMouseGrabbing] = useState(false);
  const sliderInner = useRef<HTMLDivElement | null>(null);
  const sliderContainer = useOuterClick((e: any) => handleClick(e)) as any;
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
            {React.useMemo(() => {
              return renderImages.map((image, idx: number) => (
                <div className={'slide'} key={idx}>
                  <img src={`data:image/webp;base64, ${image.webP}`} className={'images'} alt="" />
                </div>
              ));
            }, [renderImages.length])}
          </div>
        </div>
      </React.Fragment>
    </Modal>
  );
};
ImagesModalLayout.displayName = 'ImagesModalLayout';
export default ImagesModalLayout;
