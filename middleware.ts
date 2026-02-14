import { detectBot } from '@/lib/arcjet';
import arcjet, { createMiddleware } from '@arcjet/next';
import { getKindeServerSession, withAuth } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextMiddleware, NextRequest, NextResponse } from 'next/server';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:WEBHOOK', 'CATEGORY:MONITOR'],
    }),
  ],
});

async function existingMiddleware(req: NextRequest) {
  const url = req.nextUrl;

  // Skip workspace redirect for non-workspace paths
  if (!url.pathname.startsWith('/workspace')) {
    return NextResponse.next();
  }

  try {
    const { getClaim } = getKindeServerSession();
    const orgCode = await getClaim('org_code');
    const orgCodeValue = orgCode?.value;

    // If no org code, redirect to error page
    if (!orgCodeValue) {
      url.pathname = '/workspace/error';
      return NextResponse.redirect(url);
    }

    // If already on correct workspace path, continue
    if (url.pathname.includes(orgCodeValue)) {
      return NextResponse.next();
    }

    // Redirect to correct workspace
    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1) {
      // /workspace -> /workspace/{orgCode}
      url.pathname = `/workspace/${orgCodeValue}`;
    } else {
      // /workspace/wrong -> /workspace/{orgCode}
      pathSegments[1] = orgCodeValue;
      url.pathname = `/${pathSegments.join('/')}`;
    }

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

const authMiddleware = withAuth(existingMiddleware, {
  publicPaths: ['/', '/api/uploadthing'],
}) as NextMiddleware;

export default createMiddleware(aj, authMiddleware);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|rpc|.*\\..*).*)'],
  runtime: 'nodejs',
};
