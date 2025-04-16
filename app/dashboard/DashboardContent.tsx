// File: app/dashboard/DashboardContent.tsx
"use client";

import { Session } from "next-auth";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// Supprimé l'import d'Image pour utiliser l'élément img standard
import { SignOut } from "../signout/page";

interface DashboardContentProps {
  session: Session;
}

export default function DashboardContent({ session }: DashboardContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/signin");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer le cas où user serait undefined
  const userName = session?.user?.name || "Utilisateur";
  const userEmail = session?.user?.email;
  const userImage = session?.user?.image;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button 
            onClick={handleSignOut} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Déconnexion..." : "Se déconnecter"}
          </Button>
          
        </div>
        <div>
        <SignOut/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte d'information utilisateur */}
          <Card>
            <CardHeader>
              <CardTitle>Informations utilisateur</CardTitle>
              <CardDescription>Détails du compte connecté</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {userImage && (
                  // Utilisation d'une balise img standard au lieu de next/image
                  <img 
                    src={userImage} 
                    alt="Photo de profil"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold">
                    {userName}
                  </h3>
                  {userEmail && <p className="text-gray-500">{userEmail}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Aperçu de votre activité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Projets</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Tâches complétées</span>
                  <span className="font-semibold">48</span>
                </div>
                <div className="flex justify-between">
                  <span>En cours</span>
                  <span className="font-semibold">3</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Mises à jour récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="font-medium">Bienvenue {userName}!</p>
                  <p className="text-sm text-gray-500">Vous êtes connecté avec succès.</p>
                </div>
                <div className="border-l-4 border-gray-300 pl-3 py-1">
                  <p className="font-medium">Complétez votre profil</p>
                  <p className="text-sm text-gray-500">Ajoutez des informations à votre profil.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}