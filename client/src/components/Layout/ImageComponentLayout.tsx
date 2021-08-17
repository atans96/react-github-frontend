import React from 'react';
import { SideBySideMagnifier } from '../../util/react-image-magnifiers';

interface ImageComponentProps {
  urlLink: string;
  width: number;
  height: number;
  handleClick: (arg: any) => void;
}

const ImageComponentLayout: React.FC<ImageComponentProps> = ({ urlLink, height, width, handleClick }) => {
  // const { src, isLoading, error, height, width } = useImage({
  //   srcList: urlLink,
  //   useSuspense: false,
  // });
  return (
    <React.Fragment>
      <div onClick={handleClick}>
        <SideBySideMagnifier
          classNameImage={'img-loaded'}
          width={width}
          height={height}
          fillAvailableSpace={false}
          cursorStyle={'pointer'}
          fillAlignTop={true}
          alwaysInPlace={false}
          imageSrc={`data:image/webp;base64, ${urlLink}`}
        />
      </div>
    </React.Fragment>
  );
};
ImageComponentLayout.displayName = 'ImageComponentLayout';
export default ImageComponentLayout;
