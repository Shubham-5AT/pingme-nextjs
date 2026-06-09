'use client';

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/';

  useEffect(() => {
    if (!loading && user) {
      if (profile?.authProvider === "google" && !profile.mobile) {
        router.replace("/complete-phone");
      } else if (!user.emailVerified) {
        router.push("/verify-email");
      } else {
        router.push("/");
      }
    }
  }, [user, profile, loading, router, from]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with PingME today"
    >
      <SignupForm onSuccess={() => router.push("/verify-email")} />
    </AuthLayout>
  );
}
