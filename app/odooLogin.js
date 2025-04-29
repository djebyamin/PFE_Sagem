const axios = require('axios');

class OdooClient {
  constructor(url, db, username, password) {
    this.url = url;
    this.db = db;
    this.username = username;
    this.password = password;
    this.uid = null;
  }

  async login() {
    try {
      const response = await axios.post(`${this.url}/jsonrpc`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'login',
          args: [this.db, this.username, this.password],
        },
        id: Math.floor(Math.random() * 100000),
      });

      this.uid = response.data.result;

      if (this.uid) {
        console.log('✅ Connexion réussie à Odoo, UID :', this.uid);
        return this.uid;
      } else {
        console.error('❌ Échec de la connexion : identifiants invalides ou mauvaise configuration');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à Odoo :', error.message);
      return null;
    }
  }

  async callMethod(model, method, args = [], kwargs = {}) {
    if (!this.uid) {
      await this.login();
    }
    
    try {
      const response = await axios.post(`${this.url}/jsonrpc`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [this.db, this.uid, this.password, model, method, args, kwargs],
        },
        id: Math.floor(Math.random() * 100000),
      });
      
      return response.data.result;
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel de ${model}.${method}:`, error.message);
      return null;
    }
  }
}

// Exemple d'utilisation
const odoo = new OdooClient('http://localhost:8069', 'odoo', 'admin', 'admin');

// Exemple pour récupérer les partenaires
async function getPartners() {
  await odoo.login();
  const partners = await odoo.callMethod(
    'res.partner',
    'search_read',
    [[['is_company', '=', true]]],
    { fields: ['name', 'email', 'phone'] }
  );
  console.log('Partenaires :', partners);
}
async function getUsers() {
  await odoo.login();
  const users = await odoo.callMethod(
    'res.users',
    'search_read',
    [[]],  // Filtre vide pour récupérer tous les utilisateurs
    { fields: ['name', 'login', 'email', 'partner_id', 'groups_id', 'active'] }
  );
  console.log('Utilisateurs :', users);
  return users;
}

async function main() {
  await getPartners();
  await getUsers();
}
main().catch(error => {
  console.error('Erreur dans le programme principal:', error);
});