"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import companyLogo from "@/app/sagem.png";
import { signup } from "../SignUpAction";
import { useRouter } from "next/navigation";


// Schéma Zod pour validation
const signupSchema = z.object({
  nom: z.string().min(2, { message: "Le nom est requis." }),
  prenom: z.string().optional(),
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(6, { message: "Minimum 6 caractères." }),
  confirmPassword: z.string(),
  telephone: z.string().optional(),
  identifiant: z.string().min(3, { message: "Identifiant requis (min. 3 caractères)." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export function SignupPage() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
      telephone: "",
      identifiant: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      // Création de l'utilisateur avec Prisma
      const newUser = await signup({
        nom: values.nom,
        prenom: values.prenom || "", // Use empty string as fallback

        email: values.email,
        password: values.password,
        telephone: values.telephone || null,
        identifiant: values.identifiant,
      });
      
      toast.success("Inscription réussie !");
      form.reset();
      router.push("/auth/login"); // Redirection après succès
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <Image src={companyLogo} alt="Logo de l'entreprise" width={100} height={100} className="mb-4" />
          <CardTitle className="text-2xl text-center">Inscription</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="exemple@domaine.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identifiant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifiant</FormLabel>
                    <FormControl>
                      <Input placeholder="Identifiant de connexion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Créer un mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Répéter le mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2">
                S'inscrire
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <a href="/signin" className="text-sm text-blue-500 hover:underline">
              Déjà un compte ? Se connecter
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Besoin d'aide ? Contactez-nous</p>
        </CardFooter>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default SignupPage;
