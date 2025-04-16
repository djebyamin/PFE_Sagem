import { auth } from "../auth";
import { redirect } from "next/navigation";
import SignInForm from "./signinform";

// Composant serveur pour la vérification de session
export default async function Page() {
  const session = await auth();
  if (session) redirect("/dashboard");
  
  // Rendre le formulaire client
  return <SignInForm />;
}