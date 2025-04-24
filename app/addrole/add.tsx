"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ajouterRole } from './action';

export function AjouterRoleModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await ajouterRole({ nom, description });
      setOpen(false);
      setNom('');
      setDescription('');
      router.refresh(); // Rafraîchir la page pour afficher le nouveau rôle
    } catch (error) {
      setError("Une erreur s'est produite lors de l'ajout du rôle.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">Ajouter un rôle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau rôle</DialogTitle>
          <DialogDescription>
            Créez un nouveau rôle dans le système. Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom
              </Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm py-2">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting || !nom}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}