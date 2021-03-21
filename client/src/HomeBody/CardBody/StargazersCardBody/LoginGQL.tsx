import React, { CSSProperties, useState } from 'react';
import LoginLayout from '../../../Layout/LoginLayout';
import GitHubIcon from '@material-ui/icons/GitHub';
import '../../../Login.scss';
import { createPortal } from 'react-dom';
import { requestGithubGraphQLLogin, setTokenGQL } from '../../../services';
import { Nullable } from '../../../typing/type';
import { useClickOutside } from '../../../hooks/hooks';
import { noop } from '../../../util/util';

interface LoginGQLProps {
  dispatch: any;
  style: CSSProperties;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const LoginGQL: React.FC<LoginGQLProps> = React.forwardRef(({ setVisible, dispatch, style }, ref) => {
  const [token, setToken] = useState('');
  const [loginLayoutRef, setRef] = useState<Nullable<React.RefObject<HTMLDivElement>>>(null);
  const [notification, setNotification] = useState('');
  const [data, setData] = useState({ errorMessage: '', isLoading: false });
  const verifyTokenGQL = () => {
    requestGithubGraphQLLogin(token).then((res) => {
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
    verifyTokenGQL();
    setRef(null); // when loading, you cannot close the modal box
    // but after isLoading false above, loginLayoutRef exists again because
    // you re-render using setdata and setNotification above, thus causing spawnForm to re-execute
    // and get the loginLayoutRef again from LoginLayout
    setNotification("Please wait we're verifying the token");
  };
  const spawnForm = (
    portalRef: Nullable<React.RefObject<HTMLDivElement>>,
    loginLayoutRef: Nullable<React.RefObject<HTMLDivElement>>
  ) => {
    if (portalRef?.current === null || portalRef === null) {
      return null;
    } else if (portalRef?.current) {
      setRef(loginLayoutRef);
      return createPortal(
        <>
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
        </>,
        portalRef.current
      );
    }
  };
  return (
    <LoginLayout style={style} apiType={'GraphQL'} data={data} notification={notification}>
      {(portalRef, loginLayoutRef) => (
        <React.Fragment>
          <a
            className="login-link"
            target="_blank"
            rel="noopener noreferrer"
            href={'https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql'}
          >
            <GitHubIcon />
            <span>Click for tutorial</span>
          </a>
          {portalRef && spawnForm(portalRef, loginLayoutRef)}
        </React.Fragment>
      )}
    </LoginLayout>
  );
});
export default LoginGQL;
