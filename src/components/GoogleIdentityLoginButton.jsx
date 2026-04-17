import { useEffect, useRef } from 'react'
import { useGoogleOAuth } from '@react-oauth/google'
import { cn } from '../utils/helpers'

let lastInitKey = ''

/**
 * Renders Google's Sign in / Sign up button without calling
 * `google.accounts.id.initialize()` on every React mount (the default
 * `GoogleLogin` component from `@react-oauth/google` does, which triggers
 * noisy GSI warnings when navigating between pages or in React dev).
 */
export default function GoogleIdentityLoginButton({
  intent,
  onCredential,
  disabled,
  text = 'signin_with',
  className,
}) {
  const containerRef = useRef(null)
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential

  const { clientId, locale, scriptLoadedSuccessfully } = useGoogleOAuth()

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId || !containerRef.current) return

    const googleId = window.google?.accounts?.id
    if (!googleId) return

    const initKey = `${clientId}:${intent}:${locale || ''}`
    if (lastInitKey !== initKey) {
      googleId.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          onCredentialRef.current?.(credentialResponse)
        },
        ...(locale ? { hl: locale } : {}),
      })
      lastInitKey = initKey
    }

    googleId.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'pill',
      width: 360,
      ...(locale ? { locale } : {}),
    })

    return () => {
      if (!containerRef.current) return
      containerRef.current.innerHTML = ''
    }
  }, [clientId, intent, locale, scriptLoadedSuccessfully, text])

  return (
    <div
      ref={containerRef}
      className={cn('w-full flex justify-center', disabled && 'pointer-events-none opacity-60', className)}
    />
  )
}
