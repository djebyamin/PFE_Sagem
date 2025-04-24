"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createMission } from "@/app/addMissionaction"

// Define the schema for form validation
const formSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  client: z.string().min(2, "Le nom du client est requis"),
  date_debut: z.date().optional(),
  date_fin: z.date().optional(),
  priorite: z.coerce.number().min(1).max(5),
  reference_odoo: z.string().optional(),
  budget: z.coerce.number().nonnegative().optional(),
})

// Create a type for form values from the schema
type FormValues = z.infer<typeof formSchema>

export default function AddMissionPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      client: "",
      reference_odoo: "",
      budget: 0,
      date_debut: undefined,
      date_fin: undefined,
      priorite: 1,
    },
  })

  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsPending(true)
    
    const result = await createMission({
      ...values,
      date_debut: values.date_debut?.toISOString(),
      date_fin: values.date_fin?.toISOString(),
    })
    
    setIsPending(false)

    if (result.success) {
      router.push("/missions")
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Ajouter une mission</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Titre field */}
          <FormField
            control={form.control}
            name="titre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la mission</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le titre..." {...field} />
                </FormControl>
                <FormDescription>Un nom clair pour cette mission.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Décrivez brièvement..." 
                    value={field.value || ""} 
                    onChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Client field */}
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

          {/* Reference Odoo field */}
          <FormField
            control={form.control}
            name="reference_odoo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence Odoo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Code Odoo" 
                    value={field.value || ""} 
                    onChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date fields in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début field */}
            <FormField
              control={form.control}
              name="date_debut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start">
                          {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir une date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date de fin field */}
            <FormField
              control={form.control}
              name="date_fin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start">
                          {field.value ? format(field.value, "PPP", { locale: fr }) : "Choisir une date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Priorité field */}
          <FormField
            control={form.control}
            name="priorite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <FormControl>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} - {["Faible", "Normale", "Moyenne", "Haute", "Critique"][n - 1]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Budget field */}
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 5000" 
                    value={field.value || 0} 
                    onChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Création..." : "Créer la mission"}
          </Button>
        </form>
      </Form>
    </div>
  )
}