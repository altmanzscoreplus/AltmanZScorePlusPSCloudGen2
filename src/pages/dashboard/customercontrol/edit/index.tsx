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
import { CustomerEditForm } from 'src/sections/dashboard/customer/customer-edit-form';
import type { Customer } from 'src/types/customer';

const useCustomer = (): Customer | null => {
  const isMounted = useMounted();
  const [customer, setCustomer] = useState<Customer | null>(null);

  const handleCustomerGet = useCallback(async () => {
    try {
      const response = await customersApi.getCustomer();

      if (isMounted()) {
        setCustomer(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleCustomerGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return customer;
};

const Page: NextPage = () => {
  const customer = useCustomer();
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  usePageView();

  if (!customer) {
    return null;
  }

  return (
    <>
      <Seo title="Dashboard: Customer Edit" />

      <Container maxWidth="lg">
        <Stack spacing={4}>
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

          <CustomerEditForm customer={customer} />
        </Stack>
      </Container>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
