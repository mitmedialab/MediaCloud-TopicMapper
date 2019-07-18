import React from 'react';
import Route from 'react-router/lib/Route';
import { requireAuth, redirectHomeIfLoggedIn, requiresUrlParams } from './routes';
import LoginFormContainer from '../components/user/LoginFormContainer';
import SignupContainer from '../components/user/SignupContainer';
import SignupSuccessMessage from '../components/user/SignupSuccessMessage';
import ChangePasswordSuccessMessage from '../components/user/ChangePasswordSuccessMessage';
import RequestPasswordResetSuccessMessage from '../components/user/RequestPasswordResetSuccessMessage';
import ResendActivationSuccess from '../components/user/ResendActivationSuccess';
import Activated from '../components/user/Activated';
import ChangePasswordContainer from '../components/user/ChangePasswordContainer';
import RequestPasswordReset from '../components/user/RequestPasswordReset';
import ResetPasswordContainer from '../components/user/ResetPasswordContainer';
import ResetPasswordSuccessMessage from '../components/user/ResetPasswordSuccessMessage';
import UserProfileContainer from '../components/user/UserProfileContainer';
import ResendActivationForm from '../components/user/ResendActivationForm';
import UserEditProfileContainer from '../components/user/UserEditProfileContainer';
import UserConsentContainer from '../components/user/UserConsentContainer';

const userRoutes = (
  <Route path="/user">

    <Route path="/login" component={LoginFormContainer} />

    <Route path="profile" component={UserProfileContainer} onEnter={requireAuth} />

    <Route path="signup" component={SignupContainer} onEnter={redirectHomeIfLoggedIn} />
    <Route path="signup-success" component={SignupSuccessMessage} onEnter={redirectHomeIfLoggedIn} />
    <Route path="resend-activation" component={ResendActivationForm} onEnter={redirectHomeIfLoggedIn} />
    <Route path="resend-activation-success" component={ResendActivationSuccess} onEnter={redirectHomeIfLoggedIn} />
    <Route path="activated" component={Activated} onEnter={redirectHomeIfLoggedIn} />

    <Route path="request-password-reset" component={RequestPasswordReset} onEnter={redirectHomeIfLoggedIn} />
    <Route path="request-password-reset-success" component={RequestPasswordResetSuccessMessage} onEnter={redirectHomeIfLoggedIn} />
    <Route path="reset-password" component={ResetPasswordContainer} onEnter={requiresUrlParams('email', 'password_reset_token')} />
    <Route path="reset-password-success" component={ResetPasswordSuccessMessage} />

    <Route path="change-password" component={ChangePasswordContainer} onEnter={requireAuth} />
    <Route path="change-password-success" component={ChangePasswordSuccessMessage} onEnter={requireAuth} />

    <Route path="profile/edit" component={UserEditProfileContainer} onEnter={requireAuth} />
    <Route path="consent" component={UserConsentContainer} onEnter={requireAuth} />

  </Route>
);

export default userRoutes;
