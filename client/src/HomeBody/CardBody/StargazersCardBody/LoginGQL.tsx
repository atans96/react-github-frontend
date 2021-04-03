import React, { CSSProperties, useState } from 'react';
import LoginLayout from '../../../Layout/LoginLayout';
import GitHubIcon from '@material-ui/icons/GitHub';
import '../../../Login.scss';
import { requestGithubGraphQLLogin, setTokenGQL } from '../../../services';
import { Nullable } from '../../../typing/type';
import { useClickOutside } from '../../../hooks/hooks';
import { noop } from '../../../util/util';
import { useTrackedStateShared } from '../../../selectors/stateContextSelector';

interface LoginGQLProps {
  style: CSSProperties;
  setVisible: any;
}

const LoginGQL: React.FC<LoginGQLProps> = React.forwardRef(({ setVisible, style }, ref) => {
  const [token, setToken] = useState('');
  const [loginLayoutRef, setRef] = useState<Nullable<React.RefObject<HTMLDivElement>>>(null);
  const [notification, setNotification] = useState('');
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const [, dispatch] = useTrackedStateShared();
  const verifyTokenGQL = async () => {
    await requestGithubGraphQLLogin(token).then((res) => {
      if (res.success) {
        setTokenGQL(token).then(noop);
        dispatch({
          type: 'TOKEN_ADDED',
          payload: {
            tokenGQL: token,
          },
        });
        setVisible(false);
      } else {
        setNotification('Token is not valid, try again!');
        setData({ ...data, isLoading: false });
      }
    });
  };

  useClickOutside(loginLayoutRef, () => setVisible(false));

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setData({ ...data, isLoading: true });
    verifyTokenGQL().then(noop);
    setRef(null); // when loading, you cannot close the modal box
    // but after isLoading false above, loginLayoutRef exists again because
    // you re-render using setdata and setNotification above, thus causing spawnForm to re-execute
    // and get the loginLayoutRef again from LoginLayout
    setNotification("Please wait we're verifying the token");
  };
  return (
    <LoginLayout style={style} apiType={'GraphQL'} data={data} notification={notification}>
      {() => (
        <React.Fragment>
          <div className={'login-link-container'}>
            <a
              className="login-link"
              target="_blank"
              rel="noopener noreferrer"
              href={'https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token'}
            >
              <GitHubIcon />
              <span>Click for tutorial</span>
            </a>
          </div>
          <div>
            <form action="#" method="get" className="input-group">
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
});
export default LoginGQL;
