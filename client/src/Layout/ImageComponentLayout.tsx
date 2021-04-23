import React from 'react';
import useImage from '../hooks/useImage';
import { SideBySideMagnifier } from '../util/react-image-magnifiers';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import clsx from 'clsx';

interface ImageComponentProps {
  urlLink: string;
  visible: boolean;
  handleClick: (arg: any) => void;
}

export const ImageComponentLayout: React.FC<ImageComponentProps> = ({ urlLink, visible, handleClick }) => {
  const { src, isLoading, error, height, width } = useImage({
    srcList: urlLink,
    useSuspense: false,
  });
  return (
    <React.Fragment>
      <If condition={isLoading}>
        <Then>
          <div style={{ textAlign: 'center' }}>Loading Images...</div>
        </Then>
      </If>
      <If condition={!isLoading && !error && src !== undefined && src?.original?.length > 0}>
        <Then>
          <div onClick={handleClick}>
            <SideBySideMagnifier
              classNameImage={clsx('img-loaded', {
                'img-loaded-hide': !visible,
              })}
              width={width}
              height={height}
              fillAvailableSpace={false}
              cursorStyle={'pointer'}
              fillAlignTop={true}
              alwaysInPlace={false}
              imageSrc={src?.original}
            />
          </div>
        </Then>
      </If>
    </React.Fragment>
  );
};
ImageComponentLayout.displayName = 'ImageComponentLayout';
