import AuthForm from "./AuthForm";

interface AuthPageProps {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo ?? "/enter";
  const error = params.error ?? null;
  return <AuthForm redirectTo={redirectTo} callbackError={error} />;
}
