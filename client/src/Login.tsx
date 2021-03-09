import React, { useEffect, useState } from 'react';
import { getRateLimitInfo, requestGithubLogin } from './services';
import { dispatchRateLimit, dispatchRateLimitAnimation } from './store/dispatcher';
import LoginLayout from './Layout/LoginLayout';
import GithubIcon from 'mdi-react/GithubIcon';
import './Login.scss';
import CryptoJS from 'crypto-js';
import { languageList, readEnvironmentVariable } from './util';
import { Helmet } from 'react-helmet';
import { useApolloFactory } from './hooks/useApolloFactory';
import { IState } from './typing/interface';

interface LoginProps {
  state: IState;
  dispatch: any;
}

const Login: React.FC<LoginProps> = ({ state, dispatch }) => {
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const signUpAdded = useApolloFactory().mutation.signUpAdded;
  useEffect(() => {
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

      const proxy_url = state.proxy_url;
      const requestData = {
        client_id: state.client_id,
        redirect_uri: state.redirect_uri,
        client_secret: state.client_secret,
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
            });
            dispatch({
              type: 'LOGIN',
              payload: { isLoggedIn: true },
            });
            dispatchRateLimitAnimation(false, dispatch);
            getRateLimitInfo(response.token).then((data) => {
              if (data.rateLimit && data.rateLimitGQL) {
                dispatchRateLimitAnimation(true, dispatch);
                dispatchRateLimit(data.rateLimit, data.rateLimitGQL, dispatch);
              }
            });
          } else {
            setData({
              isLoading: false,
              errorMessage: 'Sorry! Login failed',
            });
          }
        })
        .then(() => {
          window.location.href = '/';
        })
        .catch(() => {
          setData({
            isLoading: false,
            errorMessage: 'Sorry! Login failed',
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, dispatch, data, history]);

  return (
    <React.Fragment>
      <Helmet>
        <title>Login to Github Profile</title>
        <meta name="description" content="Login using Github account to access more than 500 API Limit" />
      </Helmet>
      <LoginLayout data={data} apiType={'API'} notification="">
        {() => (
          <a
            className="login-link"
            href={`https://github.com/login/oauth/authorize?scope=user&client_id=${state.client_id}&redirect_uri=${state.redirect_uri}`}
            onClick={() => {
              setData({ ...data, errorMessage: '' });
            }}
          >
            <GithubIcon />
            <span>Login with GitHub</span>
          </a>
        )}
      </LoginLayout>
    </React.Fragment>
  );
};
export default Login;
