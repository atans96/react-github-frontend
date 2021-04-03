import React, { useEffect, useRef, useState } from 'react';
import { Then } from '../util/react-if/Then';
import { Modal } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { Loading } from '../util';
import { If } from '../util/react-if/If';
import useImage from '../hooks/useImage';
import SliderImage from './SliderImage';
import { useClickOutside } from '../hooks/hooks';

interface ImagesModalLayoutProps {
  clicked: boolean;
  renderImages: any;
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
const ImagesModalLayout: React.FC<ImagesModalLayoutProps> = React.forwardRef(
  ({ handleClick, clicked, renderImages }, ref) => {
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
      <If condition={clicked}>
        <Then>
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
                  setMouseGrabbing(true);
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  setMouseGrabbing(false);
                }}
              >
                <div className={'slides-inner'} ref={sliderInner}>
                  {renderImages.map((image: string, idx: number) => {
                    return <ImageModal urlLink={image} key={idx} loader={<Loading />} />;
                  })}
                </div>
              </div>
            </React.Fragment>
          </Modal>
        </Then>
      </If>
    );
  }
);
ImagesModalLayout.displayName = 'ImagesModalLayout';
export default ImagesModalLayout;
