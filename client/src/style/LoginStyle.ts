import styled from 'styled-components';
interface LoginStyleProps {
  isDisplay: string | undefined;
}
interface LoginContainerProps {
  isLoading: any;
  width: any;
}
export const LoginStyle = styled.section`
  justify-content: center;
  align-items: center;
  height: auto;
  font-family: Arial, monospace;
  display: ${({ isDisplay }: LoginStyleProps) => (isDisplay && isDisplay.length > 0 ? `${isDisplay}` : 'flex')};
  text-align: center;
  > div:nth-child(1) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    transition: 0.3s;
    width: 25%;
    height: 45%;
    > h1 {
      font-size: 2rem;
      margin-bottom: 20px;
    }
    > span:nth-child(2) {
      font-size: 1.1rem;
      color: #808080;
      margin-bottom: 70px;
    }
    > span:nth-child(3) {
      margin: 10px 0 20px;
      color: red;
    }
  }
`;
export const LoginLink = styled.a`
  text-decoration: none;
  color: #fff;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 40px;
  > span:nth-child(2) {
    margin-left: 5px;
  }
`;
export const LoginContainer = styled.div`
  background-color: #000;
  border-radius: 3px;
  color: #fff;
  display: flex;
  margin-bottom: 10px;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 70%;
`;
