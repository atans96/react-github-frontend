import React, { CSSProperties, useEffect, useState } from 'react';
import LoginLayout from '../../../Layout/LoginLayout';
import GitHubIcon from '@material-ui/icons/GitHub';
import '../../../Login.scss';
import { requestGithubGraphQLLogin, setTokenGQL } from '../../../../services';
import { Nullable } from '../../../../typing/type';
import { useOuterClick } from '../../../../hooks/hooks';
import { logoutAction, noop } from '../../../../util/util';
import { useTrackedStateShared } from '../../../../selectors/stateContextSelector';
import { useHistory } from 'react-router-dom';
import { ShouldRender } from '../../../../typing/enum';

interface LoginGQLProps {
  style: CSSProperties;
  setVisible: any;
}

const LoginGQL: React.FC<LoginGQLProps> = ({ setVisible, style }) => {
  const [token, setToken] = useState('');
  const abortController = new AbortController();
  const [, setRef] = useState<Nullable<React.RefObject<HTMLDivElement>>>(null);
  const [notification, setNotification] = useState('');
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const [stateShared, dispatch] = useTrackedStateShared();
  const history = useHistory();
  const verifyTokenGQL = async () => {
    await requestGithubGraphQLLogin(stateShared.username, token, abortController.signal)
      .then((res) => {
        if (abortController.signal.aborted) return;
        if (res.success) {
          setTokenGQL(token, stateShared.username).then(noop);
          dispatch({
            type: 'TOKEN_ADDED',
            payload: {
              tokenGQL: token,
            },
          });
          localStorage.setItem('tokenGQL', token);
          dispatch({
            type: 'SET_SHOULD_RENDER',
            payload: {
              shouldRender: ShouldRender.Home,
            },
          });
          setVisible(false);
        } else {
          setNotification('Token is not valid, try again!');
          setData({ ...data, isLoading: false });
        }
      })
      .catch(() => {
        logoutAction(history, dispatch, stateShared.username);
        window.alert('Your token has expired. We will logout you out.');
      });
  };
  const innerRef = useOuterClick(() => {
    setVisible(false);
  }) as any;
  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setData({ ...data, isLoading: true });
    verifyTokenGQL().then(noop);
    setRef(null);
    setNotification("Please wait we're verifying the token");
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setData({ ...data, isLoading: true });
    verifyTokenGQL().then(noop);
    setRef(null);
    setNotification("Please wait we're verifying the token");
  };
  return (
    <LoginLayout style={style} apiType={'GraphQL'} data={data} notification={notification} ref={innerRef}>
      {() => (
        <React.Fragment>
          <div className={'login-link-container'}>
            <a
              className="login-link"
              onClick={() =>
                window.open(
                  'https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token'
                )
              }
              href={'https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token'}
            >
              <GitHubIcon />
              <span>Click for tutorial</span>
            </a>
          </div>
          <div>
            <form action="#" method="post" className="input-group" onSubmit={handleSubmit}>
              <input
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                required
                value={token}
                style={{ width: style?.width || '', marginBottom: '20px' }}
                onChange={(e) => setToken(e.target.value)}
                type="text"
                className="form-control"
                placeholder={'Provide your token here...'}
              />
            </form>
            <button type="button" className="btn btn-primary" onClick={handleClick} style={{ marginBottom: '10px' }}>
              Verify Token
            </button>
          </div>
        </React.Fragment>
      )}
    </LoginLayout>
  );
};
export default LoginGQL;
