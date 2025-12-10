import type { FC } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { paths } from 'src/paths';
import { Issuer } from 'src/utils/auth';

const issuers: Record<Issuer, string> = {
  Amplify: '/assets/logos/logo-amplify.svg',
  Auth0: '/assets/logos/logo-auth0.svg',
  Firebase: '/assets/logos/logo-firebase.svg',
  JWT: '/assets/logos/logo-jwt.svg',
};

interface AuthPlatformProps {
  issuer: Issuer;
}

export const AuthIssuer: FC<AuthPlatformProps> = (props) => {
  const { issuer: currentIssuer } = props;

  return <></>;
};

AuthIssuer.propTypes = {
  // @ts-ignore
  issuer: PropTypes.string.isRequired,
};
