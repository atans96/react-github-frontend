import { Redirect, useHistory, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useTrackedStateRateLimit, useTrackedStateShared } from './selectors/stateContextSelector';
import GitHubIcon from '@material-ui/icons/GitHub';
import LoginLayout from './Layout/LoginLayout';
import { getRateLimitInfo, requestGithubLogin } from './services';
import sysend from 'sysend';

const Login = () => {
  const location = useLocation();
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchRateLimit] = useTrackedStateRateLimit();
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const history = useHistory();
  useEffect(() => {
    if (location.pathname === '/login') {
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
        requestGithubLogin(`${proxy_url}?&end=false`, requestData)
          .then((response) => {
            if (response.data) {
              sysend.broadcast('foo', { data: true });
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
              getRateLimitInfo().then((data) => {
                if (data.rateLimit && data.rateLimitGQL) {
                  dispatchRateLimit({
                    type: 'RATE_LIMIT_ADDED',
                    payload: {
                      rateLimitAnimationAdded: true,
                    },
                  });
                  dispatchRateLimit({
                    type: 'RATE_LIMIT',
                    payload: {
                      limit: data.rateLimit.limit,
                      used: data.rateLimit.used,
                      reset: data.rateLimit.reset,
                    },
                  });

                  dispatchRateLimit({
                    type: 'RATE_LIMIT_GQL',
                    payload: {
                      limit: data.rateLimitGQL.limit,
                      used: data.rateLimitGQL.used,
                      reset: data.rateLimitGQL.reset,
                    },
                  });
                }
              });
              history.push('/');
              // window.location.reload(false);
            } else {
              setData({
                isLoading: false,
                errorMessage: 'Sorry! Login failed',
              });
            }
          })
          .catch(() => {
            setData({
              isLoading: false,
              errorMessage: 'Sorry! Login failed',
            });
          });
      }
    }
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
              setData({ ...data, errorMessage: '' });
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
