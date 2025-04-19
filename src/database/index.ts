import { Pool, QueryResult, types } from "pg";
import env from "dotenv";
import { toSql } from "pgvector"; // ✅ Importation correcte


// Charger les variables d'environnement
env.config();

// Récupérer l'OID du type `vector`
// ➜ Exécute cette commande dans PostgreSQL :
// SELECT oid FROM pg_type WHERE typname = 'vector';
const VECTOR_OID = 16474; // ⚠️ Remplace par ton OID réel

// Définir un parseur personnalisé pour le type `vector`
types.setTypeParser(VECTOR_OID as unknown as number, (val: string) => {
  return val.replace(/[{}]/g, "").split(",").map(Number);
});

// Créer une instance de la pool de connexions à la base de données
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:0000@localhost:5432/hiring",
});

// Vérifier la connexion à la base de données
pool.connect()
  .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur de connexion à PostgreSQL :", err));

// Fonction pour exécuter les requêtes SQL
export async function executeSQLQuery(SQL: string, values: any[] = []): Promise<QueryResult<any>> {
  try {
    const result = await pool.query(SQL, values);
    return result;
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution de la requête :", error);
    throw error;
  }
}
