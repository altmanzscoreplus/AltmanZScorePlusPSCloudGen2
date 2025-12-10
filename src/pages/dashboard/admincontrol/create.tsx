import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import type { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { AdminCreateForm } from 'src/sections/dashboard/admin/admin-create-form';
import type { Admin } from 'src/types/admin';

const useAdmin = (): Admin | null => {
  const isMounted = useMounted();
  const [admin, setAdmin] = useState<Admin | null>(null);
  console.log(admin,"admin")

  const handleAdminGet = useCallback (async () => {
    try {
      const response = await customersApi.getCustomer;

      if (isMounted()) {
        setAdmin(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleAdminGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return admin;
};

const Page: NextPage = () => {
  const admin = useAdmin();
  const router = useRouter();
  const goBack = () => {
    router.back();
  };

  usePageView();

  if (!admin) {
    return null;
  }

  return (
    <>
      <Seo title="Dashboard: Admin Edit" />

      <Container maxWidth="lg">
        <Stack spacing={1}>
          <div>
            <Link
              color="text.primary"
              onClick={goBack}
              sx={{
                alignItems: 'center',
                display: 'inline-flex',
              }}
              underline="hover"
            >
              <SvgIcon sx={{ mr: 1 }}>
                <ArrowLeftIcon />
              </SvgIcon>
              <Typography variant="subtitle2">Back</Typography>
            </Link>
          </div>

          <AdminCreateForm admin={admin} />
        </Stack>
      </Container>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
