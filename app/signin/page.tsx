// app/signin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "../auth"; // adapte selon ton projet
import SigninPageClient from "./signinform";

export default async function SigninPageWrapper() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return <SigninPageClient />;
}
