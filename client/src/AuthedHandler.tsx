import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';
import React from 'react';

interface AuthedHandlerProps extends RouteComponentProps {
  component: React.ComponentClass<any>;
  redirect?: string;
  authenticator?: any;
  componentProps?: any;
  [propName: string]: any;
}

class AuthedHandler extends React.Component<AuthedHandlerProps> {
  render() {
    const { component, authenticator, componentProps, redirect, ...rest } = this.props;
    const Component = component;
    return (
      <Route
        {...rest}
        render={(props) => {
          if (authenticator) {
            return <Component componentProps={componentProps} routerProps={props} />;
          } else {
            if (redirect) {
              return <Redirect to={redirect} />;
            }
            return <div />;
          }
        }}
      />
    );
  }
}
export default withRouter(AuthedHandler);
