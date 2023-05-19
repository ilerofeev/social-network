import InfiniteScroll from 'react-infinite-scroll-component';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { ProfileImage } from './ProfileImage';
import { IconHoverEffect } from './IconHoverEffect';

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
  likedByMe: boolean;
  likeCount: number;
};

function HeartButton({ likedByMe, likeCount }: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  if (session.status !== 'authenticated') {
    return (
      <div className='my-1 flex items-center gap-3 self-start text-gray-500'>
        <IconHoverEffect red>
          <HeartIcon />
          <span>{likeCount}</span>
        </IconHoverEffect>
      </div>
    );
  }

  return (
    <button
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
        </div>
        <p className='whitespace-pre-wrap'>{content}</p>
        <HeartButton likedByMe={likedByMe} likeCount={likeCount} />
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
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>error...</h1>;
  if (posts === null) return null;

  if (!posts || posts.length === 0) {
    return <h2 className='my-4 text-center text-2xl text-gray-500'>No posts</h2>;
  }

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNewPosts}
      hasMore={hasMore}
      loader='Loading...'
    >
      {posts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </InfiniteScroll>
  );
}
