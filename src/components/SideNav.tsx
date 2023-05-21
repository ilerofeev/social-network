import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { VscAccount, VscHome, VscSignIn, VscSignOut } from 'react-icons/vsc';
import { IconHoverEffect } from './IconHoverEffect';

export function SideNav() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <nav className='sticky top-0 px-2 py-4'>
      <ul className='flex flex-col items-start gap-2 whitespace-nowrap'>
        <li>
          <Link href='/'>
            <IconHoverEffect>
              <span className='flex items-center gap-4'>
                <VscHome className='h-8 w-8' />
                <span className='hidden text-lg md:inline'>Home</span>
              </span>
            </IconHoverEffect>
          </Link>
        </li>
        {user && (
          <li>
            <Link href={`/profiles/${user.id}`}>
              <IconHoverEffect>
                <span className='flex items-center gap-4'>
                  <VscAccount className='h-8 w-8' />
                  <span className='hidden text-lg md:inline'>Profile</span>
                </span>
              </IconHoverEffect>
            </Link>
          </li>
        )}
        {user ? (
          <button onClick={() => void signOut()}>
            {' '}
            <IconHoverEffect>
              <span className='flex items-center gap-4'>
                <VscSignOut className='red-700 h-8 w-8' />
                <span className='hidden text-lg text-red-700 md:inline'>Log Out</span>
              </span>
            </IconHoverEffect>
          </button>
        ) : (
          <button onClick={() => void signIn()}>
            <IconHoverEffect>
              <span className='flex items-center gap-4'>
                <VscSignIn className='green-700 h-8 w-8' />
                <span className='hidden text-lg text-green-700 md:inline'>Log In</span>
              </span>
            </IconHoverEffect>
          </button>
        )}
      </ul>
    </nav>
  );
}
