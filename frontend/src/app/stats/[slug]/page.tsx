'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

async function fetchUrlInfo(slug: string) {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/urls/${slug}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    },
  );
  if (!resp.ok) throw new Error('Failed to load URL info');
  return resp.json() as Promise<{ longUrl: string }>;
}

async function fetchVisits(slug: string) {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/${slug}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    },
  );

  const data = await resp.json();
  return data.analytics;
}

type Visit = {
  visitedAt: string;
  ipAddress: string;
  userAgent: string;
};

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const [info, setInfo] = useState<{ longUrl: string; visits: number } | null>(
    null,
  );
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const token =
      typeof window !== 'undefined' && localStorage.getItem('token');
    if (!token) {
      router.replace('/'); 
    }
  }, [router]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchUrlInfo(slug), fetchVisits(slug)])
      .then(([urlInfo, visitLog]) => {
        setInfo({ ...urlInfo, visits: visitLog.totalVisits });
        setVisits(visitLog.recentVisits);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="p-4">Loading statistics…</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-blue-950 text-yellow-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Statistics for {slug}</h1>
        <p>
          <strong>Short URL:</strong>{' '}
          <Link
            href={`/${slug}`}
            prefetch={false}
            className="text-blue-600 hover:underline"
          >
            {origin}/{slug}
          </Link>
        </p>
        <p>
          <strong>Long URL:</strong>{' '}
          <a
            href={info!.longUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {info!.longUrl}
          </a>
        </p>
        <p>
          <strong>Total Visits:</strong> {info!.visits}
        </p>
      </header>

      <p className="font-bold">Latest 10 visits:</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-950">
            <th className="border px-4 py-2 text-left">Visited At</th>
            <th className="border px-4 py-2 text-left">IP Address</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-blue-800' : 'bg-blue-950'}>
              <td className="border px-4 py-2">
                {new Date(v.visitedAt).toLocaleString()}
              </td>
              <td className="border px-4 py-2">{v.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
