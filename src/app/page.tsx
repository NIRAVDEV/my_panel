import { LoginForm } from "@/components/login-form";
import { Gamepad2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <Gamepad2 className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold font-headline">JexactylMC</h1>
        <p className="text-muted-foreground">
          Your Minecraft server, supercharged.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
