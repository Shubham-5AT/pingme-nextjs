import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!user.emailVerified) {
        navigate("/verify-email");
      } else {
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

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
      <SignupForm onSuccess={() => navigate("/verify-email")} />
    </AuthLayout>
  );
}
