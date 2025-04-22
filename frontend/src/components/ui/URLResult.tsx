/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface URLResultProps {
  shortUrl: string;
  slug: string | null;
}

export function URLResult({ shortUrl, slug }: URLResultProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-green-600">
        Success! Here's your short URL:
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
        <a
          href={`${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {shortUrl}
        </a>

        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="sm"
          className="whitespace-nowrap border-2 border-yellow-500 bg-blue-950 text-yellow-500 rounded hover:bg-yellow-500 hover:text-blue-950"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="text-sm text-yellow-500">
        <p>Share this link with others for easy access to your original URL.</p>
      </div>
    </div>
  );
}
