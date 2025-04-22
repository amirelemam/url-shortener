'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateUrl } from '@/lib/validations';

interface URLShortenerFormProps {
  onSubmit: (longUrl: string, customSlug?: string) => void;
  loading: boolean;
}

export function URLShortenerForm({ onSubmit, loading }: URLShortenerFormProps) {
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showCustomSlug, setShowCustomSlug] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateUrl(longUrl)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    setUrlError(null);

    onSubmit(longUrl, customSlug || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 text-yellow-500">
      <h2 className="text-2xl font-semibold mb-6">Enter the URL to shorten</h2>

      <div className="mb-4">
        <label htmlFor="longUrl" className="block text-sm font-medium mb-1">
          URL
        </label>
        <Input
          id="longUrl"
          type="text"
          value={longUrl}
          onChange={(e) => {
            setLongUrl(e.target.value.trim());
            if (urlError) setUrlError(null);
          }}
          placeholder="https://example.com/long/path/to/shorten"
          className={
            urlError
              ? 'border-2 border-red-500 focus:border-red-500'
              : 'border-2 border-yellow-400 focus:border-yellow-400'
          }
          required
        />
        {urlError && <p className="mt-1 text-sm text-red-500">{urlError}</p>}
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="customSlugToggle"
            className="mr-2 border-2 border-yellow-500"
            checked={showCustomSlug}
            onChange={() => setShowCustomSlug(!showCustomSlug)}
          />
          <label htmlFor="customSlugToggle" className="text-sm">
            Use custom slug (optional)
          </label>
        </div>

        {showCustomSlug && (
          <div className="mt-2">
            <Input
              id="customSlug"
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="my-custom-slug"
              className="mt-1"
            />
            <p className="mt-1 text-xs">
              Create a custom short URL (e.g., short.ly/my-custom-slug)
            </p>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Shortening...' : 'Shorten'}
      </Button>
    </form>
  );
}
