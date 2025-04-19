// lib/odoo.ts
import axios from 'axios';

const odooUrl = 'http://localhost:8069/jsonrpc';
const db = 'odoo'; // à remplacer par le nom de ta base Odoo
const username = 'admin'; // ou ton identifiant
const password = 'admin'; // mot de passe

export const odooLogin = async () => {
  const response = await axios.post(odooUrl, {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'common',
      method: 'login',
      args: [db, username, password],
    },
    id: Math.floor(Math.random() * 10000),
  });

  return response.data.result;
};

export const getProducts = async () => {
  const uid = await odooLogin();

  const response = await axios.post(odooUrl, {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        db,
        uid,
        password,
        'product.product', // modèle Odoo
        'search_read',
        [[], ['id', 'name', 'list_price']],
      ],
    },
    id: Math.floor(Math.random() * 10000),
  });

  return response.data.result;
};
