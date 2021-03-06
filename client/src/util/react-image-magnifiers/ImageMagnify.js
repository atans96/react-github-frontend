import React from 'react';
import utils from './utils';

const ImageMagnify = React.forwardRef(function (props, ref) {
  const { onLoadRefresh, src, alt, classNameImage, onImageLoad, ...otherProps } = props;

  const [imageIdx, setImageIdx] = React.useState(0);
  const imageErrorRef = React.useRef(false);
  const imageArr = Array.isArray(src.constructor) ? src : [src];

  return (
    <img
      ref={ref}
      src={imageArr[imageIdx]}
      alt={alt}
      onLoad={(e) => {
        onImageLoad(e);
        if (imageErrorRef.current) {
          onLoadRefresh();
        }
      }}
      onError={(e) => {
        if (imageIdx < imageArr.length) {
          imageErrorRef.current = true;
          setImageIdx((idx) => idx + 1);
        }
      }}
      {...otherProps}
    />
  );
});

ImageMagnify.defaultProps = {
  onImageLoad: utils.noop,
  onLoadRefresh: utils.noop,
};

export default ImageMagnify;
