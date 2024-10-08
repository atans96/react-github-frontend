import React from 'react';
import '../Login.scss';

interface DataProps {
  errorMessage: string;
  isLoading: boolean;
}

interface LoginLayout {
  children(): React.ReactNode;
  ref?: any;
  apiType: string;
  notification: string;
  style?: React.CSSProperties;
  data: DataProps;
}

const LoginLayout: React.FC<LoginLayout> = React.forwardRef(({ style, notification, data, apiType, children }, ref) => {
  return (
    <section className="container" style={style?.display ? { display: style?.display } : { display: 'flex' }}>
      <div style={{ backgroundColor: 'white', textAlign: 'center', marginTop: '10rem' }}>
        <img
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          src="https://octodex.github.com/images/orderedlistocat.png"
        />
        <h1>Welcome</h1>
        <span>
          {notification !== '' ? notification : `Login to get 5000 API ${apiType} requests and full features access`}
        </span>
        {data?.errorMessage && <span>{data?.errorMessage}</span>}
        <div
          className="login-container"
          style={{
            width: (!data?.isLoading && style?.width) || '',
          }}
        >
          {data?.isLoading ? (
            <div className="loader-container">
              <div className="loader" />
            </div>
          ) : (
            children()
          )}
        </div>
      </div>
    </section>
  );
});
LoginLayout.displayName = 'LoginLayout';
export default LoginLayout;
