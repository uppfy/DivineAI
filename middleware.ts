import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next();
  
  // Add Link header to specify the 'as' attribute for preloaded CSS
  response.headers.append(
    'Link',
    '</_next/static/css/app.css>; rel=preload; as=style'
  );
  
  return response;
}

// Only run the middleware on pages that might preload CSS
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 