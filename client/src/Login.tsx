import { Redirect, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useTrackedStateRateLimit, useTrackedStateShared } from './selectors/stateContextSelector';
import GitHubIcon from '@material-ui/icons/GitHub';
import LoginLayout from './Layout/LoginLayout';
import { getRateLimitInfo, requestGithubLogin } from './services';
import sysend from 'sysend';
import useDeepCompareEffect from './hooks/useDeepCompareEffect';

const Login = () => {
  const abortController = new AbortController();
  const location = useLocation();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchRateLimit] = useTrackedStateRateLimit();
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const history = useHistory();
  const isMounted = useRef(false);
  useDeepCompareEffect(() => {
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
          .then((response) => {
            if (response && isMounted.current) {
              localStorage.setItem('token_type', response.token.token_type);
              localStorage.setItem('access_token', response.token.access_token);
              dispatchShared({
                type: 'LOGIN',
                payload: { isLoggedIn: true },
              });
              dispatchRateLimit({
                type: 'RATE_LIMIT_ADDED',
                payload: {
                  rateLimitAnimationAdded: false,
                },
              });
              dispatchShared({
                type: 'SET_USERNAME',
                payload: { username: response.data.login },
              });
              getRateLimitInfo({}).then((data) => {
                if (data) {
                  dispatchRateLimit({
                    type: 'RATE_LIMIT_ADDED',
                    payload: {
                      rateLimitAnimationAdded: true,
                    },
                  });
                  dispatchRateLimit({
                    type: 'RATE_LIMIT',
                    payload: {
                      limit: data.rate.limit,
                      used: data.rate.used,
                      reset: data.rate.reset,
                    },
                  });

                  dispatchRateLimit({
                    type: 'RATE_LIMIT_GQL',
                    payload: {
                      limit: data.resources.graphql.limit,
                      used: data.resources.graphql.used,
                      reset: data.resources.graphql.reset,
                    },
                  });
                  sysend.broadcast('Login', {
                    username: response.data.login,
                  });
                }
              });
              history.push('/');
              // window.location.reload(false);
            } else {
              if (abortController.signal.aborted) {
                return;
              }
              setData({
                isLoading: false,
                errorMessage: 'Sorry! Login failed',
              });
            }
          })
          .catch(() => {
            if (abortController.signal.aborted) {
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
