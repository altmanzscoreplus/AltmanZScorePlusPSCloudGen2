import type { NextPage } from 'next';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { HomeCta } from 'src/sections/home/home-cta';
import { HomeFaqs } from 'src/sections/home/home-faqs';
import { HomeFeatures } from 'src/sections/home/home-features';
import { HomeHero } from 'src/sections/home/home-hero';
import { HomeReviews } from 'src/sections/home/home-reviews';
import { useRouter } from 'src/hooks/use-router';
import { useAuth } from 'src/hooks/use-auth';
import { useEffect } from 'react';

const Page: NextPage = () => {
  usePageView();
  const router = useRouter();
  const { isAuthenticated, issuer } = useAuth();

  useEffect( () => {
    if(isAuthenticated){
      router.push('/dashboard/networktopology');
    }else{
      router.push('/auth/power-sight/login');
    }
  },[isAuthenticated])
  

  return (
    <>
      {/* <Seo /> */}
      {/* <main>
        <HomeHero />
        <HomeFeatures />
        <HomeReviews />
        <HomeCta />
        <HomeFaqs />
      </main> */}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
