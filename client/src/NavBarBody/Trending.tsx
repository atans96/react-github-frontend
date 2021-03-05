import React from 'react';
import { TrendingIcon } from '../util/icons';

class Trending extends React.Component<any> {
  render() {
    const { binder, ...rest } = this.props.componentProps;
    return (
      <li {...binder} {...rest}>
        <TrendingIcon />
        <small
          style={{
            textAlign: 'center',
            color: this.props.componentProps.active === 'trending' ? 'white' : 'black',
          }}
        >
          <strong>Trending</strong>
        </small>
      </li>
    );
  }
}
export default Trending;
