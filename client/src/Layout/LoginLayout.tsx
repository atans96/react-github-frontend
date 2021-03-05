import React, { useRef } from 'react'
import '../Login.scss'
import { Nullable } from '../typing/type'

interface DataProps {
  errorMessage: string;
  isLoading: boolean;
}

interface LoginLayout {
  children(
    portalRef: Nullable<React.RefObject<HTMLDivElement>>,
    loginLayoutRef: Nullable<React.RefObject<HTMLDivElement>>
  ): React.ReactNode;

  apiType: string;
  notification: string;
  style?: React.CSSProperties;
  data: DataProps;
}

const LoginLayout: React.FC<LoginLayout> = ({ style, notification, data, apiType, children }) => {
  const loginLayoutRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  return (
    <section
      ref={loginLayoutRef}
      className="container"
      style={style?.display ? { display: style?.display } : { display: 'flex' }}
    >
      <div style={{ backgroundColor: 'white' }}>
        <img
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          src="https://octodex.github.com/images/orderedlistocat.png"
        />
        <h1>Welcome</h1>
        <span>
          {notification !== '' ? notification : `Login to get 5000 API ${apiType} requests and full features access`}
        </span>
        <span>{data?.errorMessage}</span>
        <div id="portal" ref={portalRef} />
        <div
          className="login-container"
          style={{
            width: (!data?.isLoading && style?.width) || ''
          }}
        >
          {data?.isLoading ? (
            <div className="loader-container">
              <div className="loader" />
            </div>
          ) : (
            children(portalRef, loginLayoutRef)
          )}
        </div>
      </div>
    </section>
  )
}
export default LoginLayout
