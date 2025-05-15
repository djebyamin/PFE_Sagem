import { XMLRPCClient } from 'xmlrpc';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OdooService {
  private client: XMLRPCClient;
  private uid: number | null = null;
  private db: string;
  private username: string;
  private password: string;

  constructor(config: {
    url: string;
    db: string;
    username: string;
    password: string;
  }) {
    this.client = new XMLRPCClient({
      url: config.url,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
    this.db = config.db;
    this.username = config.username;
    this.password = config.password;
  }

  async authenticate(): Promise<boolean> {
    try {
      const result = await this.client.methodCall('authenticate', [
        this.db,
        this.username,
        this.password,
        {},
      ]);
      this.uid = result;
      return true;
    } catch (error) {
      console.error('Erreur d\'authentification Odoo:', error);
      return false;
    }
  }

  async searchRead(model: string, domain: any[], fields: string[]): Promise<any[]> {
    if (!this.uid) {
      throw new Error('Non authentifié');
    }

    try {
      return await this.client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        model,
        'search_read',
        [domain],
        { fields },
      ]);
    } catch (error) {
      console.error(`Erreur lors de la recherche dans ${model}:`, error);
      throw error;
    }
  }

  async createRecord(model: string, data: any): Promise<number> {
    if (!this.uid) {
      throw new Error('Non authentifié');
    }

    try {
      return await this.client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        model,
        'create',
        [data],
      ]);
    } catch (error) {
      console.error(`Erreur lors de la création dans ${model}:`, error);
      throw error;
    }
  }

  async updateRecord(model: string, id: number, data: any): Promise<boolean> {
    if (!this.uid) {
      throw new Error('Non authentifié');
    }

    try {
      return await this.client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        model,
        'write',
        [[id], data],
      ]);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour dans ${model}:`, error);
      throw error;
    }
  }

  // Méthode pour synchroniser les missions avec Odoo
  async syncMissions(): Promise<void> {
    try {
      // Récupérer les missions non synchronisées
      const missions = await prisma.mission.findMany({
        where: {
          reference_odoo: null,
        },
      });

      for (const mission of missions) {
        // Créer une commande dans Odoo
        const odooData = {
          name: mission.titre,
          description: mission.description,
          // Ajouter d'autres champs selon votre modèle Odoo
        };

        const odooId = await this.createRecord('sale.order', odooData);
        
        // Mettre à jour la mission avec la référence Odoo
        await prisma.mission.update({
          where: { id: mission.id },
          data: { reference_odoo: odooId.toString() },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des missions:', error);
      throw error;
    }
  }

  // Méthode pour synchroniser les rapports
  async syncRapports(): Promise<void> {
    try {
      const rapports = await prisma.rapportODOO.findMany({
        where: {
          statut: 'EN_ATTENTE',
        },
      });

      for (const rapport of rapports) {
        // Créer un rapport dans Odoo
        const odooData = {
          name: rapport.reference_odoo,
          type: rapport.type_rapport,
          data: rapport.donnees,
        };

        const odooId = await this.createRecord('report', odooData);
        
        // Mettre à jour le statut du rapport
        await prisma.rapportODOO.update({
          where: { id: rapport.id },
          data: { 
            statut: 'SYNCHRONISE',
            date_modification: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des rapports:', error);
      throw error;
    }
  }
} 