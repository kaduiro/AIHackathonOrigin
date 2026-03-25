import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // Onboarding routes (require auth but not verification)
  const onboardingRoutes = ['/interests', '/diagnosis', '/matching-results']
  const isOnboardingRoute = onboardingRoutes.some(route => pathname.startsWith(route))

  // Verification routes (require auth but not full verification)
  const verificationRoutes = ['/age-verification', '/parental-consent']
  const isVerificationRoute = verificationRoutes.some(route => pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated, fetch user profile to check verification status
  if (user && !isPublicRoute && !isOnboardingRoute && !isVerificationRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('age_group, verification_status, consent_status')
      .eq('id', user.id)
      .single()

    if (profile) {
      // User has not completed age verification yet - redirect to age-verification
      if (profile.age_group === 'unverified') {
        const url = request.nextUrl.clone()
        url.pathname = '/age-verification'
        return NextResponse.redirect(url)
      }

      // Minor without parental consent - redirect to parental-consent
      if (
        profile.age_group === 'minor' &&
        profile.consent_status !== 'submitted' &&
        profile.consent_status !== 'approved'
      ) {
        const url = request.nextUrl.clone()
        url.pathname = '/parental-consent'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
