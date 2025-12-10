import type { NextPage } from 'next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import type { AuthContextType } from 'src/contexts/auth/amplify';
import { GuestGuard } from 'src/guards/guest-guard';
import { IssuerGuard } from 'src/guards/issuer-guard';
import { useAuth } from 'src/hooks/use-auth';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import { Layout as AuthLayout } from 'src/layouts/auth/classic-layout';
import { paths } from 'src/paths';
import { AuthIssuer } from 'src/sections/auth/auth-issuer';
import { Issuer } from 'src/utils/auth';
import { Auth } from 'aws-amplify';
import ChangePasswordForm from 'src/components/changePasswordForm';
import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface Values {
  email: string;
  password: string;
  submit: null;
}

const getInitialValues = (username?: string): Values => {
  if (username) {
    return {
      email: username,
      password: '',
      submit: null,
    };
  }

  return {
    email: '',
    password: '',
    submit: null,
  };
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
});

const Page: NextPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const isMounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || undefined;
  const returnTo = searchParams.get('returnTo');
  const { issuer, signIn, signInStatus } = useAuth<AuthContextType>();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: getInitialValues(username),
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      console.log('Form values:', values);
      try {
        await signIn(values.email, values.password);
        console.log(signInStatus,'signInStatus');
        // if (isMounted() && signInStatus.success) {
        //   // setIsLoggedIn(true);
        //   router.push(returnTo || paths.dashboard.index);
        // }

        // else if (signInStatus.user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        //   // setIsLoggedIn(false);
        // }
        //  const user = await Auth.signIn(values.email, values.password);
        //  console.log(user,"user")
      
        // if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        //   console.log('NEW_PASSWORD_REQUIRED error detected'); 
        //   const searchParams = new URLSearchParams({ username: values.email }).toString();
        //   const href = paths.auth.amplify.completeNewPassword + `?${searchParams}`;
        //   // console.log('Navigating to:', href);
        //   router.push(href);
        //   return;
        // }
        
        // return user;        
      } catch (err) {
        console.error(err);
        if (err.code === 'PasswordResetRequiredException') {
          const searchParams = new URLSearchParams({ username: values.email }).toString();
            const href = paths.auth.amplify.forgotPasswordSubmit + `?${searchParams}`;
            router.push(href);
            return;          
        } 
        // if (isMounted()) {
        //   console.log('Error code:', err);
        //   if (err.code === 'UserNotConfirmedException') {
        //     const searchParams = new URLSearchParams({ username: values.email }).toString();
        //     const href = paths.auth.amplify.confirmRegister + `?${searchParams}`;
        //     router.push(href);
        //     return;
        //   }
        //   // if (err.code === 'NEW_PASSWORD_REQUIRED') {
        //   //   console.log('NEW_PASSWORD_REQUIRED error detected'); 
        //   //   const searchParams = new URLSearchParams({ username: values.email }).toString();
        //   //   const href = paths.auth.amplify.changePassword + `?${searchParams}`;
        //   //   // console.log('Navigating to:', href);
        //   //   router.push(href);
        //   //   return;
        //   // }

        //   helpers.setStatus({ success: false });
        //   helpers.setErrors({ submit: err.message });
        //   helpers.setSubmitting(false);
        // }
      }
    },
  });

  useEffect( () => {

    console.log(signInStatus,'signInStatus---Login')
    if(signInStatus.success){
      router.push(returnTo || paths.dashboard.index);
    }else if( !signInStatus.success && signInStatus.user.challengeName == 'NEW_PASSWORD_REQUIRED'){
      setIsLoggedIn(false)
    }

  },[signInStatus]);

  usePageView();

  return (
    <>
      <Seo title="Login" />
      <div>
        <Card elevation={16}>
        <CardHeader
          // subheader={
          //   <Typography
          //     color="text.secondary"
          //     variant="body2"
          //   >
          //     Don&apos;t have an account? &nbsp;
          //     <Link
          //       component={RouterLink}
          //       href={paths.auth.amplify.register}
          //       underline="hover"
          //       variant="subtitle2"
          //     >
          //       Register
          //     </Link>
          //   </Typography>
          // }
          sx={{ pb: 0 }}
          title={isLoggedIn ? "Log in" : "Change Password"}
        />
          <CardContent>
          {isLoggedIn ?(<form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack spacing={3}>
                <TextField
                  autoFocus
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Email Address"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                />
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  // type="password"
                  value={formik.values.password}
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              {formik.errors.submit && (
                <FormHelperText
                  error
                  sx={{ mt: 3 }}
                >
                  {formik.errors.submit as string}
                </FormHelperText>
              )}
              <Button
                disabled={formik.isSubmitting}
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                type="submit"
                variant="contained"
              >
                Log In
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                }}
              >
                <Link
                  component={RouterLink}
                  href={paths.auth.amplify.forgotPassword}
                  underline="hover"
                  variant="subtitle2"
                >
                  Forgot password?
                </Link>
              </Box>
            </form>):(
              <ChangePasswordForm
                  isSubmitting={formik.isSubmitting}
                  submitError={formik.errors.submit}
                  signInStatus={signInStatus}
                  setIsLoggedIn={setIsLoggedIn}
                />
            )}
          </CardContent>
        </Card>
        
      </div>
    </>
  );
};

Page.getLayout = (page) => (
  <IssuerGuard issuer={Issuer.Amplify}>
    <GuestGuard>
      <AuthLayout>{page}</AuthLayout>
    </GuestGuard>
  </IssuerGuard>
);

export default Page;
