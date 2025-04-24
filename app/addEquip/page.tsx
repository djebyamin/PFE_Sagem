"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ajouterEquipement } from "../addequipaction"

const formSchema = z.object({
  code_imo: z.string().min(1, "Le code IMO est requis"),
  nom_testeur: z.string().min(1, "Le nom du testeur est requis"),
  nom_equipement: z.string().min(1, "Le nom de l’équipement est requis"),
  designation: z.string().min(1, "La désignation est requise"),
  categorie: z.string().min(1, "La catégorie est requise"),
  nombre: z.coerce.number().min(1, "Le nombre doit être au moins 1"),
  date_mise_en_marche: z.date().optional(),
  date_garantie: z.date().optional(),
})

type EquipementFormData = z.infer<typeof formSchema>

export default function AjouterEquipementForm() {
  const form = useForm<EquipementFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code_imo: "",
      nom_testeur: "",
      nom_equipement: "",
      designation: "",
      categorie: "",
      nombre: 1,
      date_mise_en_marche: undefined,
      date_garantie: undefined,
    },
  })

  const onSubmit = async (data: EquipementFormData) => {
    try {
      const res = await ajouterEquipement(data)
      console.log("Équipement ajouté :", res)
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code_imo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code IMO</FormLabel>
              <FormControl>
                <Input placeholder="12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nom_testeur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du testeur</FormLabel>
              <FormControl>
                <Input placeholder="Nom du testeur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nom_equipement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l’équipement</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tournevis électrique" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Désignation</FormLabel>
              <FormControl>
                <Input placeholder="Désignation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Electronique">Electronique</SelectItem>
                  <SelectItem value="Mécanique">Mécanique</SelectItem>
                  <SelectItem value="Informatique">Informatique</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_mise_en_marche"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de mise en marche</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Choisir une date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_garantie"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de garantie</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Choisir une date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Ajouter l'équipement</Button>
      </form>
    </Form>
  )
}
