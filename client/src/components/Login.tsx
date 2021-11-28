import { Redirect, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useTrackedStateShared } from '../selectors/stateContextSelector';
import GitHubIcon from '@material-ui/icons/GitHub';
import LoginLayout from './Layout/LoginLayout';
import { requestGithubLogin } from '../services';
import sysend from 'sysend';

const Login = () => {
  const abortController = new AbortController();
  const location = useLocation();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const history = useHistory();
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    if (location.pathname === '/login' && isMounted.current) {
      // After requesting Github access by logging using user account's Github
      // Github redirects back to "http://localhost:3000/login?code=f5e7d855f57365e75411"
      const url = window.location.href;
      const hasCode = url.includes('?code=');

      // If Github API returns the code parameter
      if (hasCode) {
        const newUrl = url.split('?code=');
        // needed to prevent maximum depth exceed when the redirect URL from github is hit
        window.history.pushState({}, '', newUrl[0]);
        setData({ ...data, isLoading: true }); // re-render the html tag below to show the loader spinner
        const proxy_url = stateShared.proxy_url;
        const requestData = {
          client_id: stateShared.client_id,
          redirect_uri: stateShared.redirect_uri,
          client_secret: stateShared.client_secret,
          code: newUrl[1],
        };

        // Use code parameter and other parameters to make POST request to proxy_server
        requestGithubLogin(`${proxy_url}`, requestData, abortController.signal)
          .then((response: any) => {
            if (abortController.signal.aborted) return;
            if (response && response.length > 0 && isMounted.current) {
              let res: { token_type: string; token: string; data: { login: any } | { message: string } };
              try {
                res = JSON.parse(response);
                if ('message' in res?.data && res?.data?.message?.includes('API')) {
                  setData({
                    isLoading: false,
                    errorMessage: res?.data?.message,
                  });
                  return;
                }
              } catch (e) {
                setData({
                  isLoading: false,
                  errorMessage: 'Sorry! Login failed',
                });
                return;
              }
              localStorage.setItem('token_type', res.token_type);
              localStorage.setItem('access_token', res.token);
              dispatchShared({
                type: 'LOGIN',
                payload: { isLoggedIn: true },
              });
              dispatchShared({
                type: 'SET_USERNAME',
                payload: { username: 'login' in res?.data ? res.data.login : '' },
              });
              sysend.broadcast('Login', {
                username: 'login' in res?.data ? res.data.login : '',
              });
              history.push('/');
              window.location.reload(false);
            } else {
              if (!isMounted.current) {
                return;
              }
              setData({
                isLoading: false,
                errorMessage: 'Sorry! Login failed',
              });
            }
          })
          .catch(() => {
            if (!isMounted.current) {
              return;
            }
            setData({
              isLoading: false,
              errorMessage: 'Sorry! Login failed',
            });
          });
      }
    }
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (stateShared.isLoggedIn) return <Redirect to={'/'} from={'/login'} />;
  return (
    <LoginLayout data={data} apiType={'API'} notification="">
      {() => (
        <div className={'login-link-container'}>
          <a
            className="login-link"
            href={`https://github.com/login/oauth/authorize?scope=user&client_id=${stateShared.client_id}&redirect_uri=${stateShared.redirect_uri}`}
            onClick={() => {
              isMounted.current && setData({ ...data, errorMessage: '' });
            }}
          >
            <GitHubIcon />
            <span>Login with GitHub</span>
          </a>
        </div>
      )}
    </LoginLayout>
  );
};
Login.displayName = 'Login';
export default Login;
