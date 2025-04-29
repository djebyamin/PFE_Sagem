'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ajouterUtilisateur } from '@/app/addUserAction';
import { AlertCircle, UserPlus, ChevronLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  nom: z.string().min(1, { message: "Le nom est obligatoire" }),
  prenom: z.string().min(1, { message: "Le prénom est obligatoire" }),
  email: z.string().email({ message: "Email invalide" }),
  identifiant: z.string().min(1, { message: "L'identifiant est obligatoire" }),
  mot_de_passe: z.string().min(8, { message: "Mot de passe trop court" }),
  telephone: z.string().optional(),
  roleId: z.string().min(1, { message: "Sélectionnez un rôle" })
});

type FormValues = z.infer<typeof formSchema>;
type Role = { id: number; nom: string };

export default function AjouterUtilisateurPage({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "", prenom: "", email: "",
      identifiant: "", mot_de_passe: "",
      telephone: "", roleId: ""
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const result = await ajouterUtilisateur(formData);
      if (result.success) {
        router.push('/utilisateurs');
        router.refresh();
      } else {
        setError(result.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'utilisateur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-2xl">
      <div className="flex items-center mb-6 border-b pb-4">
        <UserPlus className="h-8 w-8 text-blue-600 mr-3 transition-transform hover:scale-110" />
        <h1 className="text-3xl font-semibold text-gray-800">Ajouter un nouvel utilisateur</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="nom" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Nom</FormLabel>
                  <FormControl>
                    <Input className="focus:ring-2 focus:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )} />

              <FormField name="prenom" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Prénom</FormLabel>
                  <FormControl>
                    <Input className="focus:ring-2 focus:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )} />
            </div>
            
            <div className="mt-4">
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="focus:ring-2 focus:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )} />
            </div>
            
            <div className="mt-4">
              <FormField name="telephone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Téléphone</FormLabel>
                  <FormControl>
                    <Input type="tel" className="focus:ring-2 focus:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Informations de connexion</h2>
            <div className="space-y-4">
              <FormField name="identifiant" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Identifiant</FormLabel>
                  <FormControl>
                    <Input className="focus:ring-2 focus:ring-blue-500" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-500 text-sm">
                    Utilisé pour la connexion
                  </FormDescription>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )} />

              <FormField name="mot_de_passe" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" className="focus:ring-2 focus:ring-blue-500" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-500 text-sm">
                    8 caractères minimum
                  </FormDescription>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Rôle et permissions</h2>
            <FormField name="roleId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Rôle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )} />
          </div>

          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer l'utilisateur"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
