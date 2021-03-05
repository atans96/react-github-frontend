import React from 'react';
import { HomeIcon } from '../util/icons';

class Home extends React.Component<any> {
  render() {
    const { binder, ...rest } = this.props.componentProps;
    return (
      <li {...binder} {...rest}>
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
