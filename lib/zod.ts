import { z } from "zod";

// Schéma de validation pour l'authentification
export const signInSchema = z.object({
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est obligatoire"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères"),
});

// Type pour les données d'authentification
export type SignInCredentials = z.infer<typeof signInSchema>;

// Optionnel: schéma pour l'inscription qui pourrait étendre le schéma de connexion
export const signUpSchema = signInSchema.extend({
  name: z.string().min(1, "Le nom est obligatoire"),
  confirmPassword: z.string().min(1, "La confirmation du mot de passe est obligatoire"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type SignUpCredentials = z.infer<typeof signUpSchema>;