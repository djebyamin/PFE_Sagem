// app/googlesignin.tsx
'use client'

import { Googlesign } from './server-actions'

export default function GoogleSignInButton() {
  const handleSubmit = async () => {
    await Googlesign()
  }

  return (
    <form action={handleSubmit}>
      <button
        type="submit"
        className="flex items-center gap-2 bg-white text-black border border-gray-300 px-4 py-2 rounded-md shadow hover:bg-gray-100 transition duration-200"
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.09 0 5.88 1.07 8.07 2.84l6.02-6.02C34.6 2.63 29.63 0 24 0 14.7 0 6.88 5.84 3.36 14.09l7.5 5.83C12.75 13.2 17.9 9.5 24 9.5z"
          />
          <path
            fill="#34A853"
            d="M46.1 24.5c0-1.4-.13-2.75-.36-4.05H24v7.65h12.4c-.54 2.85-2.2 5.26-4.7 6.9v5.7h7.6c4.44-4.1 7-10.15 7-16.2z"
          />
          <path
            fill="#4A90E2"
            d="M3.36 14.09A23.85 23.85 0 000 24c0 3.8.91 7.4 2.52 10.5l7.68-5.97C8.1 25.74 7.5 24 7.5 22s.6-3.74 2.7-6.03l-6.84-5.88z"
          />
          <path
            fill="#FBBC05"
            d="M24 48c6.48 0 11.9-2.13 15.9-5.8l-7.6-5.7c-2.1 1.4-4.84 2.2-8.3 2.2-6.1 0-11.3-4.1-13.2-9.6l-7.7 6C6.9 42.2 14.7 48 24 48z"
          />
        </svg>
        Sign in with Google
      </button>
    </form>
  )
}
