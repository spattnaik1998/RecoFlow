import AuthForm from "./AuthForm";

interface AuthPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo ?? "/enter";
  return <AuthForm redirectTo={redirectTo} />;
}
