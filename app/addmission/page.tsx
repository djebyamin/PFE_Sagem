"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  titre: z.string().min(2, {
    message: "Le titre doit comporter au moins 2 caractères.",
  }),
  description: z.string().optional(),
  client: z.string().optional(),
  referenceOdoo: z.string().min(1, {
    message: "La référence Odoo est obligatoire.",
  }),
})

export function MissionForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: any) => {
    console.log(data)

    // Ajoutez ici votre logique pour envoyer les données à l'API.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Titre */}
        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Entrez le titre de la mission" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Entrez la description de la mission" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client */}
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <Input placeholder="Nom du client" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Référence Odoo */}
        <FormField
          control={form.control}
          name="referenceOdoo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Référence Odoo</FormLabel>
              <FormControl>
                <Input placeholder="Référence unique Odoo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Ajouter Mission</Button>
      </form>
    </Form>
  )
}
