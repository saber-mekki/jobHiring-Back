import { Pool, QueryResult } from "pg";
import env from "dotenv";

// Charger les variables d'environnement
env.config();

// Créer une instance de la pool de connexions à la base de données
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:0000@localhost:5432/hiring", // Utiliser l'URL depuis les variables d'environnement
});

// Fonction pour exécuter les requêtes SQL
export async function executeSQLQuery(SQL: string, values: any[] = []): Promise<QueryResult<any>> {
  try {
    // Exécution de la requête SQL avec des valeurs paramétrées
    const result = await pool.query(SQL, values);
    return result; // Retourne le résultat
  } catch (error) {
    // En cas d'erreur, on rejette l'erreur
    throw error;
  }
}
