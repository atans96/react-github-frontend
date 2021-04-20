import React from 'react';
import useImage from '../hooks/useImage';
import { SideBySideMagnifier } from '../util/react-image-magnifiers';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';
import BlurHashLayout from './BlurHashLayout';

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
      <If condition={!isLoading && !error}>
        <Then>
          <If condition={visible && src !== undefined && src?.original?.length > 0}>
            <Then>
              <div onClick={handleClick}>
                <SideBySideMagnifier
                  classNameImage={'img-loaded'}
                  width={width}
                  height={height}
                  fillAvailableSpace={false}
                  cursorStyle={'pointer'}
                  fillAlignTop={true}
                  alwaysInPlace={false}
                  imageSrc={src?.original || ''}
                />
              </div>
            </Then>
          </If>
          <If condition={!visible && src !== undefined && src?.blurHash?.length > 0}>
            <Then>
              <div onClick={handleClick}>
                <BlurHashLayout
                  hash={src?.blurHash || ''}
                  punch={1}
                  width={width}
                  height={'auto'}
                  style={{ maxWidth: '350px' }}
                />
              </div>
            </Then>
          </If>
        </Then>
      </If>
    </React.Fragment>
  );
};
ImageComponentLayout.displayName = 'ImageComponentLayout';
