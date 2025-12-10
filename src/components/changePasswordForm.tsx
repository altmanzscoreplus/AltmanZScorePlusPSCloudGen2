import { TextField } from '@material-ui/core';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import type { AuthContextType } from 'src/contexts/auth/amplify';
import { useAuth } from 'src/hooks/use-auth';
import { useMounted } from 'src/hooks/use-mounted';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import { paths } from 'src/paths';
import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface Values {
    email: string;
    newPassword: string;
    confirmPassword: string;
    submit: null;
  }
  
  const getInitialValues = (username?: string): Values => {
    return {
      email: username || '',
      newPassword: '',
      confirmPassword: '',
      submit: null,
    };
  };
  
  const validationSchema = Yup.object({
    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    newPassword: Yup.string().min(7, 'Must be at least 7 characters').max(255).required('Required'),
    confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Required'),
  });

const ChangePasswordForm = ({ isSubmitting, submitError, signInStatus, setIsLoggedIn }) => {
  const isMounted = useMounted();
  const router = useRouter();
  
  // console.log(username,"user name")
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || undefined;
  const { completeNewPassword } = useAuth<AuthContextType>();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const formik = useFormik({
        enableReinitialize: true,
        initialValues: getInitialValues(signInStatus.user.username),
        validationSchema,
        onSubmit: async (values, helpers): Promise<void> => {
          console.log('Form values:', values, signInStatus);
          try {
            // console.log('Form values:', values.confirmPassword, signInStatus.user.username);
            await completeNewPassword(signInStatus.user, values.confirmPassword);
    
            if (isMounted()) {
              setIsLoggedIn(true)
              router.push(paths.dashboard.index);
            }
          } catch (err) {
            console.error(err);
    
            if (isMounted()) {
              helpers.setStatus({ success: false });
              helpers.setErrors({ submit: err.message });
              helpers.setSubmitting(false);
            }
          }
        }});

  return (
    <>
      <form
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <Stack spacing={3}>
                {signInStatus.user.username ? (
                  <TextField
                    disabled
                    fullWidth
                    label="Email"
                    value={signInStatus.user.username}
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
                  {/* <Card > */}
                  <TextField
                    error={!!(formik.touched.newPassword && formik.errors.newPassword)}
                    fullWidth
                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                    label="New Password"
                    name="newPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    // type="password"
                    value={formik.values.newPassword}
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
                  {/* </Card> */}
                  <TextField
                    error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    fullWidth
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    label="Confirm Password"
                    name="confirmPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    // type="password"
                    value={formik.values.confirmPassword}
                    type={showConfirmPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
      </Stack>
      {submitError && (
        <FormHelperText error sx={{ mt: 3 }}>
          {submitError}
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
        Confirm
      </Button>
      </form>
    </>
  );
};

export default ChangePasswordForm;