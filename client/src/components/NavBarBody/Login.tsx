import React from 'react';
import { LoginIcon } from '../../util/icons';

class Login extends React.Component<any> {
  render() {
    const { binder, ...rest } = this.props.componentProps;
    return (
      <li {...binder} {...rest}>
        <LoginIcon />
        <small
          style={{
            textAlign: 'center',
            color: this.props.componentProps.active === 'login' ? 'white' : 'black',
          }}
        >
          <strong>Login</strong>
        </small>
      </li>
    );
  }
}

export default Login;
