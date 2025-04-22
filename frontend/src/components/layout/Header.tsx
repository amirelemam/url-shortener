'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login'); 
  };

  return (
    <header className="w-full bg-blue-950 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-yellow-500">
          MyApp
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    href="/"
                    className="
                  block w-32 text-center
                  px-2 py-2 text-sm font-medium
                  text-yellow-500
                  border-2 border-transparent
                  rounded
                  transition-colors
                  hover:bg-yellow-500 hover:text-blue-950 hover:border-yellow-500
                "
                  >
                    Shorten URL
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-urls"
                    className="
                  block w-20 text-center
                  px-2 py-2 text-sm font-medium
                  text-yellow-500
                  border-2 border-transparent
                  rounded
                  transition-colors
                  hover:bg-yellow-500 hover:text-blue-950 hover:border-yellow-500
                "
                  >
                    My URLs
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="
                    block w-20 text-center
                    px-2 py-2 text-sm font-medium
                    text-red-500
                    border-2 border-transparent
                    rounded
                    transition-colors
                    hover:bg-red-500 hover:text-white
                  "
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/register"
                    className="
                      block w-20 text-center
                      px-3 py-2 text-sm font-medium
                      border border-yellow-500
                      rounded
                      transition-colors
                      bg-blue-950 text-yellow-500
                      hover:bg-yellow-500 hover:text-blue-950 hover:border-yellow-500
                    "
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="
                      block w-20 text-center
                      px-2 py-2 text-sm font-medium
                      text-yellow-500
                      border-2 border-yellow-500
                      rounded
                      transition-colors
                      hover:bg-yellow-500 hover:text-blue-950 hover:border-yellow-500
                    "
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
