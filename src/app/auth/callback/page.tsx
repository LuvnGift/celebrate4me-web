'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { connectSocket } from '@/lib/socket';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const userParam = searchParams.get('user');

    if (userParam) {
      try {
        const user = JSON.parse(userParam);
        setUser(user);

        // Connect socket via the API (token is in httpOnly cookie)
        api.get('/api/v1/auth/socket-token')
          .then((r) => connectSocket(r.data.data.token))
          .catch(() => { /* non-critical */ });

        router.replace(user.role === 'ADMIN' ? '/admin' : '/');
      } catch {
        router.replace('/login?error=oauth_failed');
      }
    } else {
      router.replace('/login?error=oauth_failed');
    }
  }, [searchParams, setUser, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-3">
        <Spinner />
        <p className="text-muted-foreground text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
