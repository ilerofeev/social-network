import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import { api } from '~/utils/api';
import '~/styles/globals.css';
import { SideNav } from '~/components/SideNav';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => (
  <SessionProvider session={session}>
    <Head>
      <title>Social Network</title>
      <meta
        name="description"
        content="This is a full-stack social network project"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className="container mx-auto flex items-start sm:pr-4">
      <SideNav />
      <div className="min-h-screen flex-grow border-x">
        <Component {...pageProps} />
      </div>
    </div>
  </SessionProvider>
);

export default api.withTRPC(MyApp);
