import React, { useEffect, useState } from 'react';
import useImage from '../hooks/useImage';
import { SideBySideMagnifier } from '../util/react-image-magnifiers';
import { isEqualObjects, Loading } from '../util';
import { If } from '../util/react-if/If';
import { Then } from '../util/react-if/Then';

interface ImageComponentProps {
  urlLink: string;
  visible: boolean;
  handleClick: (arg: any) => void;
}
export const ImageComponentLayout: React.FC<ImageComponentProps> = React.memo(
  ({ urlLink, visible, handleClick }) => {
    const { src, isLoading, error, height, width } = useImage({
      srcList: urlLink,
      useSuspense: false,
    });
    return (
      <React.Fragment>
        <If condition={isLoading}>
          <Then>
            <Loading />
          </Then>
        </If>
        <If condition={!isLoading && !error && visible}>
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
                imageSrc={src}
              />
            </div>
          </Then>
        </If>
      </React.Fragment>
    );
  },
  (prevProps: any, nextProps: any) => {
    return (
      isEqualObjects(prevProps.visible, nextProps.visible) &&
      isEqualObjects(prevProps.handleClick, nextProps.handleClick) &&
      isEqualObjects(prevProps.urlLink, nextProps.urlLink)
    );
  }
);
ImageComponentLayout.displayName = 'ImageComponentLayout';
