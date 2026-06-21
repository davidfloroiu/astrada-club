import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ambient relative flex min-h-screen flex-col">
      <Container className="py-6">
        <Logo href="/" />
      </Container>
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
