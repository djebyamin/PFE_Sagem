// app/ajouter-utilisateur/page.tsx
import { getRoles } from "@/app/getRoles";
import AjouterUtilisateurPage from "@/app/addUser/AjouterUtilisateurClient";

export default async function Page() {
  const roles = await getRoles();
  return <AjouterUtilisateurPage roles={roles} />;
}
