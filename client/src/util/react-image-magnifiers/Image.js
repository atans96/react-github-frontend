import React from 'react';
import utils from './utils';

const Image = React.forwardRef(function (props, ref) {
  const { onLoadRefresh, src, alt, classNameImage, height, width, ...otherProps } = props;

  const [imageIdx, setImageIdx] = React.useState(0);
  const imageErrorRef = React.useRef(false);
  const imageArr = Array.isArray(src.constructor) ? src : [src];

  return (
    <img
      ref={ref}
      width={width}
      height={height}
      className={classNameImage}
      src={imageArr[imageIdx]}
      alt={alt}
      onLoad={() => {
        if (imageErrorRef.current) {
          onLoadRefresh();
        }
      }}
      onError={() => {
        if (imageIdx < imageArr.length) {
          imageErrorRef.current = true;
          setImageIdx((idx) => idx + 1);
        }
      }}
      {...otherProps}
    />
  );
});

Image.defaultProps = {
  onLoadRefresh: utils.noop,
};
Image.displayName = 'Image';
export default Image;
