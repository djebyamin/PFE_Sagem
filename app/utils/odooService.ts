import axios from 'axios';

const ODOO_URL = 'http://localhost:8069/odoo/users';
const ODOO_DB = 'odoo';
const ODOO_USERNAME = 'admin';
const ODOO_PASSWORD = 'admin';

export async function createPartnerInOdoo(name: string, email: string, phone?: string | null) {
  try {
    // Authentification auprès d'Odoo
    console.log('Tentative d\'authentification Odoo...');
    const authResponse = await axios.post(ODOO_URL, {
      jsonrpc: '2.0',
      method: 'call',
      id: 1,
      params: {
        service: 'common',
        method: 'authenticate',
        args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}],
      },
    });

    // Vérifier si l'authentification a réussi
    const uid = authResponse.data.result;
    if (!uid) {
      console.error('Échec de l\'authentification avec Odoo. Réponse d\'authentification:', authResponse.data);
      throw new Error('Erreur authentification Odoo');
    }
    console.log('Authentification réussie, UID:', uid);

    // Création du partenaire dans Odoo
    console.log('Tentative de création du partenaire dans Odoo avec les données:', { name, email, phone });
    const createResponse = await axios.post(ODOO_URL, {
      jsonrpc: '2.0',
      method: 'call',
      id: 2,
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          ODOO_DB,
          uid,
          ODOO_PASSWORD,
          'res.partner',
          'create',
          [{
            name: name,
            email: email,
            phone: phone || '', // Si téléphone est vide, passer une chaîne vide
            customer_rank: 1, // facultatif : peut être ajusté selon les besoins
          }],
        ],
      },
    });

    // Vérification si la création a réussi et retourne l'ID du partenaire créé
    const partnerId = createResponse.data.result;
    if (!partnerId) {
      console.error('Échec de la création du partenaire dans Odoo. Réponse de création:', createResponse.data);
      throw new Error('Erreur lors de la création du partenaire dans Odoo');
    }

    console.log('Partenaire créé avec succès, ID:', partnerId);
    return partnerId; // ID du partenaire créé
  } catch (error: unknown) { // Caster l'erreur en unknown
    // Vérifier si c'est une instance d'Error
    if (error instanceof Error) {
      console.error('Erreur dans la création du partenaire dans Odoo:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Erreur inconnue lors de la création du partenaire dans Odoo:', error);
    }

    // Si l'erreur a une réponse, afficher les détails
    if (axios.isAxiosError(error) && error.response) {
      console.error('Détails de la réponse d\'erreur:', error.response.data);
    }

    throw error; // Propager l'erreur pour qu'elle soit gérée dans l'appelant
  }
}
