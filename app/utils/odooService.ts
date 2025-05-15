// utils/odooService.ts

export async function createPartnerInOdoo(nomComplet: string, email: string, telephone?: string | null) {
  const ODOO_URL = 'http://localhost:8069/jsonrpc'; // CORRECT URL for JSON-RPC
  const ODOO_DB = 'odoo';
  const ODOO_USERNAME = 'admin';
  const ODOO_PASSWORD = 'admin';

  // 1. Authentification
  const loginResponse = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'login',
        args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD],
      },
      id: 1,
    }),
  });

  const loginData = await loginResponse.json();
  const userId = loginData.result;

  if (!userId) {
    throw new Error('Échec de connexion à Odoo');
  }

  // 2. Création du partenaire
  const createResponse = await fetch(ODOO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          ODOO_DB,
          userId,
          ODOO_PASSWORD,
          'res.partner',
          'create',
          [{
            name: nomComplet,
            email: email,
            phone: telephone || '',
          }],
        ],
      },
      id: 2,
    }),
  });

  const createData = await createResponse.json();

  if (!createData.result) {
    throw new Error('Échec de la création du partenaire Odoo');
  }

  return createData.result;
}
