import React, { useEffect, useState } from 'react';
import { getRateLimitInfo, requestGithubLogin } from './services';
import LoginLayout from './Layout/LoginLayout';
import GitHubIcon from '@material-ui/icons/GitHub';
import './Login.scss';
import CryptoJS from 'crypto-js';
import { languageList, readEnvironmentVariable } from './util';
import { Helmet } from 'react-helmet';
import { useApolloFactory } from './hooks/useApolloFactory';
import { useLocation, useHistory } from 'react-router-dom';
import { useTrackedStateRateLimit, useTrackedStateShared } from './selectors/stateContextSelector';

const Login = () => {
  const [stateShared, dispatchShared] = useTrackedStateShared();
  const [, dispatchRateLimit] = useTrackedStateRateLimit();
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const displayName: string | undefined = (Login as React.ComponentType<any>).displayName;
  const signUpAdded = useApolloFactory(displayName!).mutation.signUpAdded;
  const history = useHistory();
  const location = useLocation();
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
        requestGithubLogin(proxy_url, requestData)
          .then((response) => {
            if (response.data) {
              signUpAdded({
                variables: {
                  username: response.data.login,
                  avatar: response.data.avatar_url !== '' ? response.data.avatar_url : '',
                  token: response.token,
                  code: newUrl[1],
                  languagePreference: languageList.reduce((acc, language: string) => {
                    acc.push(Object.assign({}, { language, checked: true }));
                    return acc;
                  }, [] as any[]),
                },
              }).then(({ data }: any) => {
                localStorage.setItem('sess', data.signUp.token);
                localStorage.setItem(
                  'jbb',
                  CryptoJS.TripleDES.encrypt(response.data.login, readEnvironmentVariable('CRYPTO_SECRET')!).toString()
                );
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
                getRateLimitInfo(response.token).then((data) => {
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
                window.location.reload(false);
              });
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

  return (
    <React.Fragment>
      <Helmet>
        <title>Login to Github Profile</title>
        <meta name="description" content="Login using Github account to access more than 500 API Limit" />
      </Helmet>
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
    </React.Fragment>
  );
};
Login.displayName = 'Login';
export default Login;
