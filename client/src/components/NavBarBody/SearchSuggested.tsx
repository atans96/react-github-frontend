import React from 'react';
import { SearchIcon } from '../../util/icons';

class Discover extends React.Component<any> {
  render() {
    const { ...rest } = this.props.componentProps;
    return (
      <li {...rest}>
        <SearchIcon />
        <small
          style={{
            textAlign: 'center',
            color: this.props.componentProps.active === 'discover' ? 'white' : 'black',
          }}
        >
          <strong>Discover</strong>
        </small>
      </li>
    );
  }
}
export default Discover;
