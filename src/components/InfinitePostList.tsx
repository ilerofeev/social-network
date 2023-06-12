import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { ProfileImage } from './ProfileImage';
import { IconHoverEffect } from './IconHoverEffect';
import { api } from '~/utils/api';
import { LoadingSpinner } from './LoadingSpinner';

dayjs.extend(relativeTime);

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type InfinitePostListProps = {
  isLoading: boolean;
  isError: boolean;
  fetchNewPosts: () => Promise<unknown>;
  hasMore?: boolean;
  posts?: Post[];
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' });

type HeartButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  likedByMe: boolean;
  likeCount: number;
};

function HeartButton({ onClick, isLoading, likedByMe, likeCount }: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== 'authenticated') {
    return (
      <div className='my-1 mt-1 flex items-center gap-3 self-start text-gray-500'>
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
        likedByMe ? 'text-red-500' : 'text-gray-500 hover:text-red-500 focus-visible:text-red-500'
      }`}
    >
      <IconHoverEffect red>
        <HeartIcon
          className={`transition-colors duration-200 ${
            likedByMe
              ? 'fill-red-500'
              : 'fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500'
          }`}
        />
      </IconHoverEffect>
      <span>{likeCount}</span>
    </button>
  );
}

function PostCard({ id, user, content, createdAt, likedByMe, likeCount }: Post) {
  const trpcUtils = api.useContext();

  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<typeof trpcUtils.post.infiniteFeed.setInfiniteData>[1] = (
        oldData
      ) => {
        if (!oldData) return;

        const countModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === id
                ? {
                    ...post,
                    likeCount: post.likeCount + countModifier,
                    likedByMe: addedLike,
                  }
                : post
            ),
          })),
        };
      };
      trpcUtils.post.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.post.infiniteFeed.setInfiniteData({ onlyFollowing: true }, updateData);
      trpcUtils.post.infiniteProfileFeed.setInfiniteData({ userId: user.id }, updateData);
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.message;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error('Failed to post! Please try again later');
      }
    },
  });

  const handleToggleLike = () => {
    toggleLike.mutate({ id });
  };

  return (
    <li className='flex gap-4 border-b px-4 py-4'>
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className='flex flex-grow flex-col'>
        <div className='flex gap-1'>
          <Link
            href={`/profiles/${user.id}`}
            className='font-bold hover:underline focus-visible:underline'
          >
            {user.name}
          </Link>
          <span className='text-gray-500'>-</span>
          <span className='text-gray-500'>{dateTimeFormatter.format(createdAt)}</span>
          <span className='text-gray-500'>({dayjs(createdAt).fromNow()})</span>
        </div>
        <p className='whitespace-pre-wrap'>{content}</p>
        <HeartButton
          onClick={handleToggleLike}
          isLoading={toggleLike.isLoading}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      </div>
    </li>
  );
}

export function InfinitePostList({
  posts,
  isError,
  isLoading,
  fetchNewPosts,
  hasMore = false,
}: InfinitePostListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>error...</h1>;
  if (posts === null) return null;

  if (!posts || posts.length === 0) {
    return <h2 className='my-4 text-center text-2xl text-gray-500'>No posts</h2>;
  }

  return (
    <ul>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </InfiniteScroll>
    </ul>
  );
}
