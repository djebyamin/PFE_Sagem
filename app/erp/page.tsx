"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { submitTaskToOdoo } from "./odoo";

// Définir un schéma Zod pour la validation du formulaire
const taskSchema = z.object({
  name: z.string().min(1, "Le nom de la tâche est requis"),
  description: z.string().min(5, "La description doit être plus longue"),
});

// Inferred type from the schema
export type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskSubmissionForm() {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "", // Default value for the name field
      description: "", // Default value for the description field
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      const result = await submitTaskToOdoo(data);
      alert("Tâche soumise avec succès!");
    } catch (error) {
      alert("Erreur lors de la soumission de la tâche");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la tâche</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la tâche" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Soumettre la tâche</Button>
      </form>
    </Form>
  );
}
