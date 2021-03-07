import React, { useEffect, useState } from 'react';
import useImage from '../hooks/useImage';
import { SideBySideMagnifier } from '../util/react-image-magnifiers';
import { Loading } from '../util';

interface ImageComponentProps {
  urlLink: string;
  visible: boolean;
  onProgress: (arg: string) => void;
  handleClick: (arg: any) => void;
  restOfTheImages: boolean;
  imagesCount: any;
  loadingCount: any;
  getImageSrcs?: any;
}

export const ImageComponentLayout: React.FC<ImageComponentProps> = ({
  restOfTheImages,
  imagesCount,
  urlLink,
  visible,
  onProgress,
  handleClick,
  loadingCount,
  getImageSrcs,
}) => {
  const { src, isLoading, error, height, width } = useImage({
    srcList: urlLink,
    useSuspense: false,
  });
  const filter = (
    visible: boolean,
    height: number,
    width: number,
    count: number,
    error: boolean,
    restOfTheImages: boolean
  ) => {
    if (restOfTheImages) {
      return visible && height > 193 && width > 64 && getImageSrcs().indexOf(src) === -1 && error === null;
    } else {
      return visible && height > 193 && width > 64 && count < 2 && error === null;
    }
  };
  const [JSXRender, setJSXRender] = useState<any>();
  const whichToRender = () => {
    onProgress(Math.random().toString(36).substring(7));
    if (isLoading && loadingCount.current < 2) {
      const count = loadingCount.current.valueOf();
      loadingCount.current = count + 1;
      return <Loading />;
    } else if (
      !isLoading &&
      height &&
      width &&
      filter(visible, height, width, imagesCount.current, error, restOfTheImages)
    ) {
      const count = imagesCount.current.valueOf();
      imagesCount.current = count + 1;
      return (
        <div onClick={handleClick}>
          <SideBySideMagnifier
            classNameImage={'img-loaded'}
            width={width}
            height={height}
            fillAvailableSpace={false}
            cursorStyle={'pointer'}
            fillAlignTop={true}
            alwaysInPlace={false}
            imageSrc={src}
          />
        </div>
      );
    } else {
      return <></>;
    }
  };
  useEffect(() => {
    setJSXRender(whichToRender());
  }, [isLoading]);

  return <>{JSXRender}</>;
};
