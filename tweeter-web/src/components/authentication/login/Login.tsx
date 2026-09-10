import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoActions";
import { LoginPresenter, LoginView } from "../../../presenter/LoginPresenter";

interface Props {
  originalUrl?: string;
  presenter?: LoginPresenter;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: LoginView = {
    updateUserInfo,
    displayErrorMessage,
    navigate,
    setIsLoading,
  };

  const presenterRef = useRef<LoginPresenter | null>(null);

  if (!presenterRef.current) {
    presenterRef.current =
      props.presenter ?? new LoginPresenter(listener, props.originalUrl);
  }

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields
          alias={alias}
          password={password}
          setAlias={setAlias}
          setPassword={setPassword}
          onEnterFunction={doLogin}
        />
      </>
    );
  };

  const doLogin = () => {
    presenterRef.current!.doLogin(alias, password, rememberMe);
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={() => !alias || !password}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
