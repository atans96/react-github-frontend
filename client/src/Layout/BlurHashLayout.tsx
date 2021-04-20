import * as React from 'react';

import BlurhashCanvas from './BlurHashCanvas';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hash: string;
  /** CSS height, default: 128 */
  height?: number | string | 'auto';
  punch?: number;
  resolutionX?: number;
  resolutionY?: number;
  style?: React.CSSProperties;
  /** CSS width, default: 128 */
  width?: number | string | 'auto';
};

const canvasStyle: React.CSSProperties = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '100%',
};

export default class BlurHashLayout extends React.PureComponent<Props> {
  static defaultProps = {
    height: 128,
    width: 128,
    resolutionX: 64,
    resolutionY: 64,
  };

  render() {
    const { hash, height, width, punch, resolutionX, resolutionY, style, ...rest } = this.props;
    return (
      <div {...rest} style={{ display: 'inline-block', width, height, ...style, position: 'relative' }}>
        <BlurhashCanvas hash={hash} height={resolutionY} width={resolutionX} punch={punch} style={canvasStyle} />
      </div>
    );
  }
}
