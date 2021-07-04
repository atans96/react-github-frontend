import React from 'react';
import useImage from '../hooks/useImage';
import { SideBySideMagnifier } from '../util/react-image-magnifiers';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';

interface ImageComponentProps {
  urlLink: string;
  handleClick: (arg: any) => void;
}

const ImageComponentLayout: React.FC<ImageComponentProps> = ({ urlLink, handleClick }) => {
  const { src, isLoading, error, height, width } = useImage({
    srcList: urlLink,
    useSuspense: false,
  });
  const imgRef = React.createRef<HTMLDivElement>();
  return (
    <React.Fragment>
      <If condition={isLoading}>
        <Then>
          <div style={{ textAlign: 'center' }}>Loading Images...</div>
        </Then>
      </If>
      <If condition={!isLoading && !error && src !== undefined && src?.original?.length > 0}>
        <Then>
          <div onClick={handleClick} ref={imgRef}>
            <SideBySideMagnifier
              classNameImage={'img-loaded'}
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
export default ImageComponentLayout;
