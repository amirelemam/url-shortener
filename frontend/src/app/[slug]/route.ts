/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: any
) {
  const { slug } = context.params;

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_API_URL}/${slug}`,
    { status: 307 }
  );
}
