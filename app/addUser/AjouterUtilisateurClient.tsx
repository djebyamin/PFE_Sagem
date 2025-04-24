'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem,
  FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ajouterUtilisateur } from '@/app/addUserAction';

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Ajouter un nouvel utilisateur</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="nom" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="prenom" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="identifiant" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Identifiant</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormDescription>Utilisé pour la connexion</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="mot_de_passe" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl><Input type="password" {...field} /></FormControl>
              <FormDescription>8 caractères minimum</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="telephone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl><Input type="tel" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="roleId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                   <SelectItem key={role.id} value={role.id.toString()}>{role.nom}</SelectItem>

                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création en cours..." : "Créer l'utilisateur"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
