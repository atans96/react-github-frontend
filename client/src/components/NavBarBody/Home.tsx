import React from 'react';
import { HomeIcon } from '../../util/icons';

class Home extends React.Component<any> {
  render() {
    const { ...rest } = this.props.componentProps;
    return (
      <li {...rest}>
        <HomeIcon />
        <small
          style={{
            textAlign: 'center',
            color: this.props.componentProps.active === 'home' ? 'white' : 'black',
          }}
        >
          <strong>Home</strong>
        </small>
      </li>
    );
  }
}

export default Home;
