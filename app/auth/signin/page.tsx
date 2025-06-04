"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome, Calendar, Mail, Shield, Bot } from "lucide-react";
import { DragonLogo } from "@/components/dragon-logo";


export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* Replace the Image with DragonLogo */}
            <DragonLogo size="xl" className="mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">
            AI Productivity Assistant
          </CardTitle>
          <CardDescription>
            Your personal AI-powered productivity partner. Connect your Google
            account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Bot className="h-4 w-4 text-blue-500" />
              <span>AI-powered insights and suggestions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>Smart calendar management</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-red-500" />
              <span>Email analysis and insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-purple-500" />
              <span>Secure OAuth authentication</span>
            </div>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <Chrome className="h-5 w-5 mr-2" />
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
              <br />
              We only access the data you explicitly grant permission for.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
