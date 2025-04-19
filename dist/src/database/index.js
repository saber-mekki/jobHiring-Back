"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSQLQuery = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Récupérer l'OID du type `vector`
// ➜ Exécute cette commande dans PostgreSQL :
// SELECT oid FROM pg_type WHERE typname = 'vector';
const VECTOR_OID = 16474; // ⚠️ Remplace par ton OID réel
// Définir un parseur personnalisé pour le type `vector`
pg_1.types.setTypeParser(VECTOR_OID, (val) => {
    return val.replace(/[{}]/g, "").split(",").map(Number); // ✅ Convertir en tableau de nombres
});
// Créer une instance de la pool de connexions à la base de données
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:0000@localhost:5432/hiring",
});
// Vérifier la connexion à la base de données
exports.pool.connect()
    .then(() => console.log("✅ Connexion réussie à PostgreSQL"))
    .catch((err) => console.error("❌ Erreur de connexion à PostgreSQL :", err));
// Fonction pour exécuter les requêtes SQL
function executeSQLQuery(SQL, values = []) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield exports.pool.query(SQL, values);
            return result;
        }
        catch (error) {
            console.error("❌ Erreur lors de l'exécution de la requête :", error);
            throw error;
        }
    });
}
exports.executeSQLQuery = executeSQLQuery;
//# sourceMappingURL=index.js.map