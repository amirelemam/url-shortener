'use client';

import { useState } from 'react';
import Link from 'next/link';

type UrlCardProps = {
  slug: string;
  longUrl: string;
  visits: number;
  onUpdateSlug: (oldSlug: string, newSlug: string) => Promise<void>;
};

export function UrlCard({ slug, longUrl, visits, onUpdateSlug }: UrlCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftSlug, setDraftSlug] = useState(slug);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const startEdit = () => {
    setDraftSlug(slug);
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setIsEditing(false);
    setDraftSlug(slug);
  };
  const confirmEdit = async () => {
    await onUpdateSlug(slug, draftSlug);
    setIsEditing(false);
  };

  return (
    <div className="border rounded p-4 shadow mb-4">
      <p className="mb-2">
        <strong>Short URL:</strong>{' '}
        {isEditing ? (
          <input
            className="border px-2 py-1 rounded w-40"
            value={draftSlug}
            onChange={(e) => setDraftSlug(e.target.value)}
          />
        ) : (
          <Link
            href={`/${slug}`}
            prefetch={false}
            className="text-blue-600 hover:underline"
          >
            {origin}/{slug}
          </Link>
        )}
        {isEditing ? (
          <>
            <button
              onClick={cancelEdit}
              className="ml-2 px-2 py-1 border-2 border-blue-950 bg-yellow-500 text-blue-950  rounded hover:bg-blue-950 hover:text-yellow-500 hover:border-yellow-500"
            >
              Cancel
            </button>
            <button
              onClick={confirmEdit}
              className="ml-2 px-2 py-1 border-2 border-yellow-500 bg-blue-950 text-yellow-500  rounded hover:bg-yellow-500 hover:text-blue-950"
            >
              Confirm
            </button>
          </>
        ) : (
          <button
            onClick={startEdit}
            className="ml-2 px-2 py-1 border-2 border-yellow-500 bg-blue-950 text-yellow-500 rounded hover:bg-yellow-500 hover:text-blue-950"
          >
            Edit
          </button>
        )}
      </p>
      <p className="mb-1">
        <strong>Long URL:</strong> {longUrl}
      </p>
      <p>
        <strong>Total Visits:</strong> {visits}
      </p>
      <Link
        href={`/stats/${slug}`}
        prefetch={false}
        className="text-blue-600 hover:underline"
      >
        <button className="ml-2 px-2 py-1 border-2 border-blue-950 bg-yellow-500 text-blue-950  rounded hover:bg-blue-950 hover:text-yellow-500 hover:border-yellow-500">
          Statistics
        </button>
      </Link>
    </div>
  );
}
