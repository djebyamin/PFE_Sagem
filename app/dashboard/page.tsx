import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const session = await auth();
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!session) {
    redirect("/signin");
  }
  
  return <DashboardContent session={session} />;
}