import axios from "axios";

// URL de votre instance Odoo
const ODOO_URL = "http://localhost:8069/odoo/project";

// Define the TaskFormData type (you can import it if it's defined elsewhere)
import { TaskFormData } from './page';

// Fonction pour envoyer les données de la tâche à Odoo
export const submitTaskToOdoo = async (taskData: TaskFormData): Promise<any> => {
  try {
    const response = await axios.post(ODOO_URL, taskData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la soumission de la tâche:", error);
    throw error;
  }
};
