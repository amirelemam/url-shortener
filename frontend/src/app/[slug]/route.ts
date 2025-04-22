/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: any
) {
  const { slug } = context.params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/short/${slug}`);

  if (res.status === 404) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/short/${slug}`, {
    status: 307,
  });
}
