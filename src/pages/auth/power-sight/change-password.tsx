import type { NextPage } from 'next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { MuiOtpInput } from 'mui-one-time-password-input';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

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
import { Issuer } from 'src/utils/auth';
import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface Values {
  email: string;
  oldPassword: string;
  password: string;
  submit: null;
}

const getInitialValues = (username?: string): Values => {
  return {
    email: username || '',
    oldPassword: '',
    password: '',
    submit: null,
  };
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
  oldPassword: Yup.string().min(7, 'Must be at least 7 characters').max(255).required('Required'),
  password: Yup.string().min(7, 'Must be at least 7 characters').max(255).required('Required'),
});

const Page: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || undefined;
  const { completeNewPassword } = useAuth<AuthContextType>();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleClickShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(username),
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      console.log('Form values:', values);
      try {
        await completeNewPassword(values.email, values.oldPassword, values.password);
        
        if (isMounted()) {
          const searchParams = new URLSearchParams({ username: values.email }).toString();
          const href = paths.auth.amplify.login + `?${searchParams}`;
          router.push(href);
        }
      } catch (err) {
        console.error(err);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  usePageView();

  return (
    <>
      <Seo title="Login" />
      <div>
        <Card elevation={16}>
          <CardHeader
            sx={{ pb: 0 }}
            title="Login"
          />
          <CardContent>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack spacing={3}>
                {username ? (
                  <TextField
                    disabled
                    fullWidth
                    label="Email"
                    value={username}
                  />
                ) : (
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
                )}
                <TextField
                  error={!!(formik.touched.oldPassword && formik.errors.oldPassword)}
                  fullWidth
                  helperText={formik.touched.oldPassword && formik.errors.oldPassword}
                  label="Old Password"
                  name="oldPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  // type="password"
                  value={formik.values.oldPassword}
                  type={showOldPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowOldPassword}
                          edge="end"
                        >
                          {showOldPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="New Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  // type="password"
                  value={formik.values.password}
                  type={showNewPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowNewPassword}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
              >
                Confirm
              </Button>
            </form>
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
