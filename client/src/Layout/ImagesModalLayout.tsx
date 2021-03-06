import React, { useRef, useState } from 'react';
import { Then } from '../util/react-if/Then';
import { Modal } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { Loading } from '../util';
import { If } from '../util/react-if/If';
import useImage from '../hooks/useImage';
import { nanoid } from 'nanoid';

interface SearchBarLayout {
  modal: boolean;
  renderImages: any;
  handleClick: any;
  handleProgressPromiseUnrender: any;
  Visible: boolean;
}
interface ImageComponentProps {
  urlLink: string;
  visible: boolean;
  onProgress: (arg: string) => void;
  handleClick: (arg: any) => void;
  loader?: JSX.Element;
}
const ImageModal: React.FC<ImageComponentProps> = ({ urlLink, visible }) => {
  const { src, isLoading, error, height, width } = useImage({
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
const ImagesModalLayout: React.FC<SearchBarLayout> = ({
  modal,
  renderImages,
  handleClick,
  handleProgressPromiseUnrender,
  Visible,
}) => {
  const [mouseGrabbing, setMouseGrabbing] = useState(false);
  const sliderInner = useRef<HTMLDivElement | null>(null);
  const sliderContainer = useRef<HTMLDivElement | null>(null);
  return (
    <If condition={modal}>
      <Then>
        <Modal open={modal}>
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
                {renderImages.map((image: string) => {
                  return (
                    <ImageModal
                      urlLink={image}
                      key={nanoid()}
                      loader={<Loading />}
                      handleClick={handleClick}
                      onProgress={handleProgressPromiseUnrender}
                      visible={Visible}
                    />
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        </Modal>
      </Then>
    </If>
  );
};
export default ImagesModalLayout;
