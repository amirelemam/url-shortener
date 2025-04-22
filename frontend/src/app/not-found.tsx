/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 text-yellow-500">
      <h1 className="text-4xl font-bold mb-8 text-center">404 - Not Found</h1>
      <p className="text-lg mb-8 text-center">
        The shortened URL you are looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-yellow-500 text-blue-950 rounded hover:bg-yellow-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
