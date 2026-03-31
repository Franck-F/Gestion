import { useEffect, useRef, useState } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function GoogleLoginButton({ onSuccess }) {
  const buttonRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    function initGoogle() {
      if (!window.google?.accounts?.id) {
        setTimeout(initGoogle, 100)
        return
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential)
          }
        },
      })

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonRef.current.offsetWidth,
          text: 'continue_with',
          shape: 'rectangular',
          locale: 'fr',
        })
      }
      setReady(true)
    }

    initGoogle()
  }, [onSuccess])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div>
      <div ref={buttonRef} className="w-full flex justify-center" />
      {!ready && (
        <div className="w-full h-10 rounded-lg bg-surface-100 animate-pulse" />
      )}
    </div>
  )
}
