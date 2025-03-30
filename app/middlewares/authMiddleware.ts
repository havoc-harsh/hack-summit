import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '../lib/utils'
import cookie from 'cookie'

export async function middleware(req: NextRequest) {
  const cookies = cookie.parse(req.headers.get('cookie') || '')
  const token = cookies.hospitalToken

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    verifyToken(token)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/api/protected/:path*', '/dashboard/:path*'],
}