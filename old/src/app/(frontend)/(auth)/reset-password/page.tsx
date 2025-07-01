'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Zod schema for password validation
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Infer TypeScript type
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: data.password }),
    });

    const resData = await res.json();

    setLoading(false);

    if (res.ok) {
      router.push('/login');
    } else {
      setMessage(resData.message || 'Failed to reset password.');
    }
  };

  return (
    <Card className="max-w-sm mx-auto my-32">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              {...register('password')}
              disabled={loading}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </CardContent>
    </Card>
  );
}
