import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { VscArrowLeft } from 'react-icons/vsc';
import { useSession } from 'next-auth/react';
import ErrorPage from 'next/error';
import { ssgHelper } from '~/server/api/ssgHelper';
import { api } from '~/utils/api';
import { IconHoverEffect } from '~/components/IconHoverEffect';
import { ProfileImage } from '~/components/ProfileImage';
import { InfinitePostList } from '~/components/InfinitePostList';
import { Button } from '~/components/Button';

export async function getStaticProps(context: GetStaticPropsContext<{ id: string }>) {
  const id = context.params?.id;

  if (!id) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }

  const ssg = ssgHelper();
  await ssg.profile.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

function FollowButton({
  userId,
  isFollowing,
  isLoading,
  onClick,
}: {
  userId: string;
  isFollowing: boolean;
  isLoading: boolean;
  onClick: () => void;
}) {
  const session = useSession();
  if (session.status !== 'authenticated' || session.data.user.id === userId) return null;

  return (
    <Button onClick={onClick} disabled={isLoading} small gray={isFollowing}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}

const pluralRules = new Intl.PluralRules();
function getPlural({
  number,
  singular,
  plural,
}: {
  number: number;
  singular: string;
  plural: string;
}) {
  return pluralRules.select(number) === 'one' ? singular : plural;
}

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ id }) => {
  const { data: profile } = api.profile.getById.useQuery({ id });
  const posts = api.post.infiniteProfileFeed.useInfiniteQuery(
    { userId: id },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const trpcUtils = api.useContext();
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      trpcUtils.profile.getById.setData({ id }, (oldData) => {
        if (!oldData) return;
        const countModifier = addedFollow ? 1 : -1;
        return {
          ...oldData,
          isFollowing: addedFollow,
          followersCount: oldData.followersCount + countModifier,
        };
      });
    },
  });

  if (!profile?.name) return <ErrorPage statusCode={404} />;

  return (
    <>
      <Head>
        <title>{`Social Network - ${profile.name}`}</title>
      </Head>
      <header className='sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2'>
        <Link href='..' className='mr-2'>
          <IconHoverEffect>
            <VscArrowLeft className='h-6 w-6' />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={profile.image} className='flex-shrink-0' />
        <div className='ml-2 flex-grow'>
          <h1 className='text-lg font-bold'>{profile.name}</h1>
          <div className='text-gray-500'>
            {profile.postsCount}{' '}
            {getPlural({ number: profile.postsCount, singular: 'Post', plural: 'Posts' })}
            {' - '}
            {profile.followersCount}{' '}
            {getPlural({
              number: profile.followersCount,
              singular: 'Follower',
              plural: 'Followers',
            })}{' '}
            {' - '}
            {` ${profile.followsCount} Followings`}
          </div>
        </div>
        <FollowButton
          isFollowing={profile.isFollowing}
          isLoading={toggleFollow.isLoading}
          userId={id}
          onClick={() => toggleFollow.mutate({ userId: id })}
        />
      </header>
      <main>
        <InfinitePostList
          posts={posts.data?.pages.flatMap((page) => page.posts)}
          isError={posts.isError}
          isLoading={posts.isLoading}
          hasMore={posts.hasNextPage}
          fetchNewPosts={posts.fetchNextPage}
        />
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
});

export default ProfilePage;
