'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function AuthComponent() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Sign in to ChatPrivate
      </h2>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#8b5cf6',
                brandAccent: '#7c3aed',
                inputBackground: 'rgba(255,255,255,0.1)',
                inputText: 'white',
                inputPlaceholder: '#9ca3af',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button',
            input: 'auth-input',
          },
        }}
        providers={['google']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/`}
        theme="dark"
      />
      <p className="text-center text-gray-400 text-sm mt-4">
        Free: 5 messages/day • Pro: Unlimited
      </p>
    </div>
  );
}
