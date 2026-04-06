'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMe } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const profileSchema = z.object({
  username: z.string().min(3).max(30),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Min. 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { data: user, isLoading } = useMe();
  const { setUser } = useAuthStore();
  const [twoFADialog, setTwoFADialog] = useState<'setup' | 'disable' | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpToken, setTotpToken] = useState('');

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      profileForm.reset({ username: user.username, phone: user.phone ?? '' });
    }
  }, [user]);

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const res = await api.patch('/api/v1/users/me', data);
      if (user) {
        setUser({ ...user, ...res.data.data });
      }
      toast.success('Profile updated.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to update profile.');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await api.post('/api/v1/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed.');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to change password.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  const initials = user?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Account settings</h1>

      <div className="space-y-6">
        {/* Profile section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.username}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...profileForm.register('username')} />
                {profileForm.formState.errors.username && (
                  <p className="text-destructive text-xs">
                    {profileForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ''} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...profileForm.register('phone')} type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password section */}
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  {...passwordForm.register('currentPassword')}
                  type="password"
                  autoComplete="current-password"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-destructive text-xs">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  {...passwordForm.register('newPassword')}
                  type="password"
                  autoComplete="new-password"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-destructive text-xs">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-xs">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2FA section */}
        <Card>
          <CardHeader>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>
              {user?.twoFactorEnabled
                ? '2FA is enabled on your account.'
                : 'Add an extra layer of security to your account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.twoFactorEnabled ? (
              <Button
                variant="destructive"
                onClick={() => { setTwoFADialog('disable'); setTotpToken(''); }}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    const res = await api.post('/api/v1/auth/2fa/setup');
                    setQrCode(res.data.data.qrCode);
                    setTwoFADialog('setup');
                    setTotpToken('');
                  } catch {
                    toast.error('Failed to setup 2FA.');
                  }
                }}
              >
                Enable 2FA
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 2FA Setup Dialog */}
        <Dialog open={twoFADialog === 'setup'} onOpenChange={() => setTwoFADialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Set up 2FA</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app, then enter the 6-digit code to verify.
              </DialogDescription>
            </DialogHeader>
            {qrCode && (
              <div className="flex justify-center py-2">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="setup-token">Verification code</Label>
                <Input
                  id="setup-token"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button
                className="w-full"
                disabled={totpToken.length !== 6}
                onClick={async () => {
                  try {
                    await api.post('/api/v1/auth/2fa/verify', { token: totpToken });
                    toast.success('2FA enabled successfully.');
                    setTwoFADialog(null);
                    window.location.reload();
                  } catch {
                    toast.error('Invalid code. Please try again.');
                  }
                }}
              >
                Verify & Enable
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 2FA Disable Dialog */}
        <Dialog open={twoFADialog === 'disable'} onOpenChange={() => setTwoFADialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Disable 2FA</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="disable-token">Verification code</Label>
                <Input
                  id="disable-token"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                disabled={totpToken.length !== 6}
                onClick={async () => {
                  try {
                    await api.post('/api/v1/auth/2fa/disable', { token: totpToken });
                    toast.success('2FA disabled.');
                    setTwoFADialog(null);
                    window.location.reload();
                  } catch {
                    toast.error('Invalid code. Please try again.');
                  }
                }}
              >
                Confirm Disable
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
