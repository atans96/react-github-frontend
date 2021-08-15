import React from 'react';
import { LogoutIcon } from '../../util/icons';

class Logout extends React.Component<any> {
  render() {
    const { binder, ...rest } = this.props.componentProps;
    return (
      <li {...binder} {...rest}>
        <LogoutIcon />
        <small
          style={{
            textAlign: 'center',
            color: this.props.componentProps.active === 'logout' ? 'white' : 'black',
          }}
        >
          <strong>Logout</strong>
        </small>
      </li>
    );
  }
}
export default Logout;
