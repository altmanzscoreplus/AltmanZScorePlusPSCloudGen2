import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { Auth } from '@aws-amplify/auth';

import { amplifyConfig } from 'src/config';
import type { User } from 'src/types/user';
import { Issuer } from 'src/utils/auth';

import type { State } from './auth-context';
import { AuthContext, initialState } from './auth-context';
import User03 from '@untitled-ui/icons-react/build/esm/User03';

Auth.configure({
  userPoolId: amplifyConfig.aws_user_pools_id,
  userPoolWebClientId: amplifyConfig.aws_user_pools_web_client_id,
  region: amplifyConfig.aws_cognito_region,
});

enum ActionType {
  INITIALIZE = 'INITIALIZE',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
}

type InitializeAction = {
  type: ActionType.INITIALIZE;
  payload: {
    isAuthenticated: boolean;
    user: User | null;
  };
};

type SignInAction = {
  type: ActionType.SIGN_IN;
  payload: {
    user: User;
  };
};

type SignOutAction = {
  type: ActionType.SIGN_OUT;
};

type Action = InitializeAction | SignInAction | SignOutAction;

type Handler = (state: State, action: any) => State;

const handlers: Record<ActionType, Handler> = {
  INITIALIZE: (state: State, action: InitializeAction): State => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  SIGN_IN: (state: State, action: SignInAction): State => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  SIGN_OUT: (state: State): State => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state: State, action: Action): State =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  //const signInStatus = { success: false, user: {} };
  const [signInStatus, setSignInStatus] = useState({ success: false, user: {} });

  const initialize = useCallback(async (): Promise<void> => {
    try {
      const user = await Auth.currentAuthenticatedUser();

      // Here you should extract the complete user profile to make it
      // available in your entire app.
      // The auth state only provides basic information.

      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          isAuthenticated: true,
          user: {
            id: user.attributes.sub,
            avatar: '/assets/avatars/avatar-ken-kious.png',
            email: user.attributes.email,
            name: 'Ken Kious',
            plan: 'Premium',
          },
        },
      });
    } catch (error) {
      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [dispatch]);

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    await Auth.signOut();
    setSignInStatus({success:false, user:{}});
    dispatch({
      type: ActionType.SIGN_OUT,
    });
    
  }, [dispatch]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const user = await Auth.signIn(email, password);
  console.log(user,"user-dis")
      if (user.challengeName) {
        console.error(
          `Unable to login, because challenge "${user.challengeName}" is mandated and we did not handle this case.`
        );

        // signInStatus.success = false;
        // signInStatus.user = user

        setSignInStatus({success:false, user})

        return;
      }

      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user: {
            id: user.attributes.sub,
            avatar: '/assets/avatars/avatar-ken-kious.png',
            email: user.attributes.email,
            name: 'Ken Kious',
            plan: 'Premium',
          },
        },
      });

      setSignInStatus({success:true, user:{}})
    },
    [dispatch]
  );

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    await Auth.signUp({
      username: email,
      password,
      attributes: { email },
    });
  }, []);

  const confirmSignUp = useCallback(async (username: string, code: string): Promise<void> => {
    await Auth.confirmSignUp(username, code);
  }, []);

  const resendSignUp = useCallback(async (username: string): Promise<void> => {
    await Auth.resendSignUp(username);
  }, []);

  const forgotPassword = useCallback(async (username: string): Promise<void> => {
    await Auth.forgotPassword(username);
  }, []);

  const forgotPasswordSubmit = useCallback(
    async (username: string, code: string, newPassword: string): Promise<void> => {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
    },
    []
  );

  const completeNewPassword = useCallback(
    async (user: any, password: string): Promise<void> => {
      await Auth.completeNewPassword(user, password);
    },[]);

    // const sendCustomChallengeAnswer = useCallback(
    //   async (user: any, otp: string): Promise<void> => {
    //     await Auth.sendCustomChallengeAnswer(user, otp);
    //   },[]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        issuer: Issuer.Amplify,
        signIn,
        signInStatus,
        signUp,
        confirmSignUp,
        resendSignUp,
        forgotPassword,
        forgotPasswordSubmit,
        completeNewPassword,
        // sendCustomChallengeAnswer,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
