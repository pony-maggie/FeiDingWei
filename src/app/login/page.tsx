import { LoginForm } from "@/components/login-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const demoUsers = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { name: true, email: true }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6 text-ink">
      <div className="w-full max-w-md">
        <LoginForm demoUsers={demoUsers} />
      </div>
    </main>
  );
}
