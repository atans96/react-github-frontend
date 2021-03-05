import React from 'react';
import useImage from '../hooks/useImage';
import { SideBySideMagnifier } from '../util/react-image-magnifiers';
import { Loading } from '../util';

interface ImageComponentProps {
  urlLink: string;
  visible: boolean;
  onProgress: (arg: string) => void;
  handleClick: (arg: any) => void;
}

export const ImageComponentLayout: React.FC<ImageComponentProps> = ({ urlLink, visible, onProgress, handleClick }) => {
  const { src, isLoading, error, height } = useImage({
    srcList: urlLink,
    useSuspense: false,
  });
  if (isLoading) {
    return <Loading />;
  } else if (!isLoading && height) {
    onProgress(Math.random().toString(36).substring(7));
    if (visible) {
      return (
        <div onClick={handleClick}>
          <SideBySideMagnifier
            classNameImage={'img-loaded'}
            fillAvailableSpace={false}
            cursorStyle={'pointer'}
            fillAlignTop={true}
            alwaysInPlace={false}
            imageSrc={error !== null ? '' : src}
          />
        </div>
      );
    }
  }
  return <></>;
};
