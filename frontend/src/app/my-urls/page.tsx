'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { urlService } from '@/services/url-service';
import { UrlCard } from '@/components/ui/UrlCard';
import { useRouter } from 'next/navigation';

type UrlEntry = { slug: string; longUrl: string; visits: number };

export default function MyUrlsPage() {
  const router = useRouter();
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateSlug = async (oldSlug: string, newSlug: string) => {
    await urlService.updateUrlSlug(oldSlug, newSlug);
    setUrls((us) =>
      us.map((u) => (u.slug === oldSlug ? { ...u, slug: newSlug } : u)),
    );
  };

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.replace('/');
      return;
    }

    async function fetchUrls() {
      try {
        const data = await urlService.getMyUrls();

        const raw = data
          .slice()
          .sort((a, b) => Number(b.visitCount) - Number(a.visitCount));

        const entries: UrlEntry[] = raw.map((u) => ({
          slug: u.slug,
          longUrl: u.longUrl,
          visits: (u as any).visitCount ?? 0,
        }));

        setUrls(entries);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load URLs');
      } finally {
        setLoading(false);
      }
    }
    fetchUrls();
  }, [router]);

  if (loading) return <p className="p-4">Loading your URLs...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-blue-950 text-yellow-500">
      <h1 className="text-3xl font-bold mb-6">My URLs</h1>
      {urls.map((u) => (
        <UrlCard
          key={u.slug}
          slug={u.slug}
          longUrl={u.longUrl}
          visits={u.visits}
          onUpdateSlug={handleUpdateSlug}
        />
      ))}
    </div>
  );
}
