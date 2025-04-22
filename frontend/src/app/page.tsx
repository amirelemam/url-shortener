'use client';

import { useState } from 'react';
import { URLShortenerForm } from '@/components/forms/URLShortenerForm';
import { URLResult } from '@/components/ui/URLResult';
import { Card } from '@/components/ui/Card';
import { urlService } from '@/services/url-service';

export default function Home() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (longUrl: string, customSlug?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await urlService.shortenURL(longUrl, customSlug);
      const origin = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      setSlug(response.slug);
      setShortUrl(`${origin}/${response.slug}`);
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-950">
      <div className="w-full lg:min-w-[48rem] px-4">
        <Card>
          <URLShortenerForm onSubmit={handleSubmit} loading={loading} />
        </Card>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
        {shortUrl && (
          <Card>
            <URLResult shortUrl={shortUrl} slug={slug} />
          </Card>
        )}
      </div>
    </div>
  );
}
