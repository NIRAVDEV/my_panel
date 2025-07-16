
"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";
import type { User } from "@/lib/types";
import { users } from "@/lib/server-data";

type LoginState = {
  error?: string;
  user?: User | null;
  success?: boolean;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90" disabled={pending}>
            {pending ? 'Signing In...' : 'Sign In'}
        </Button>
    );
}

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({});

  const handleLogin = (formData: FormData) => {
    setState({ user: undefined, error: undefined });
    // Mock login logic
    setTimeout(() => {
        const email = formData.get('email');
        if (email === 'admin@admin.com') {
            const user = users.find(u => u.email === email);
            setState({ success: true, user });
        } else {
            setState({ error: "Invalid credentials (mock response)." });
        }
    }, 500);
  };

  useEffect(() => {
    if (state.user) {
      router.push("/dashboard");
    }
  }, [state.user, router]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your server panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleLogin} className="grid gap-4">
          {state.error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@admin.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required defaultValue="admin123" />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
