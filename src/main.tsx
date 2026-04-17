import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#00D1FF',
          colorBackground: '#0a0a0a',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255,255,255,0.5)',
          colorInputBackground: 'rgba(255,255,255,0.05)',
          colorInputText: '#ffffff',
          borderRadius: '1rem',
        },
        elements: {
          card: 'bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]',
          headerTitle: 'text-white font-black tracking-widest uppercase',
          headerSubtitle: 'text-white/50',
          socialButtonsBlockButton: 'border-white/10 bg-white/5 hover:bg-white/10 text-white',
          formFieldInput: 'bg-white/5 border-white/10 text-white placeholder:text-white/30',
          formButtonPrimary: 'bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-black font-bold',
          footerActionLink: 'text-[#00D1FF] hover:text-[#00D1FF]/80',
          identityPreview: 'bg-white/5 border-white/10',
          userButtonPopoverCard: 'bg-[#0a0a0a] border border-white/10',
          userButtonPopoverActionButton: 'text-white hover:bg-white/10',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
