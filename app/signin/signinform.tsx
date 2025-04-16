"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import logo from "@/app/sagem.png";
import Googlesign from "@/app/googlesignin";
import { auth } from "../auth";

// Zod schema
const signinSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(6, { message: "Mot de passe requis (min. 6 caractères)." }),
});

export default function SigninPage() {
  
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signinSchema>) => {
    try {
      // Remplacer par votre logique de connexion (API / Auth)
      console.log("Connexion avec :", values);
      toast.success("Connexion réussie !");
      router.push("/dashboard"); // Redirection après connexion
    } catch (error: any) {
      toast.error("Erreur lors de la connexion.");
    }
  };
 const Page=async()=>{
    const session =await auth() ;
    if (session) redirect("/")
 }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <Image src={logo} alt="Logo" width={100} height={100} className="mb-4" />
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre compte
          </CardDescription>

          {/* Google SignIn Button */}
          <Googlesign />

        </CardHeader>
        <CardContent>
          {/* Bouton Google */}
          

          {/* Séparateur "ou" */}
          <div className="flex items-center gap-2 my-4">
            <div className="h-px bg-gray-300 flex-1" />
            <span className="text-sm text-gray-500">ou</span>
            <div className="h-px bg-gray-300 flex-1" />
          </div>

          {/* Formulaire email/mot de passe */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Votre mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2"
              >
                Se connecter
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <a href="/signup" className="text-sm text-blue-500 hover:underline">
              Pas encore de compte ? S'inscrire
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
