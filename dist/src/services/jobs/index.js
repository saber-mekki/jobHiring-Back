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
exports.deleteJob = exports.updateJob = exports.addJob = exports.getJob = void 0;
const database_1 = require("../../database");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const generateJobEmbedding = (text) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        if (!text) {
            resolve(null);
            return;
        }
        const pythonProcess = (0, child_process_1.spawn)('python', [
            path_1.default.join(__dirname, '../ai/embeddingService.py'),
            text
        ]);
        let stdoutData = '';
        let stderrData = '';
        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script failed: ${stderrData}`));
                return;
            }
            try {
                const result = JSON.parse(stdoutData);
                if (result.error) {
                    reject(new Error(result.error));
                }
                else {
                    resolve(result);
                }
            }
            catch (e) {
                reject(new Error('Failed to parse embedding result'));
            }
        });
    });
});
// Mettre à jour les embeddings lors de l'ajout/modification
const updateJobEmbedding = (jobId, text) => __awaiter(void 0, void 0, void 0, function* () {
    const embedding = yield generateJobEmbedding(text);
    yield (0, database_1.executeSQLQuery)(`UPDATE public."jobTable" SET job_embedding = $1 WHERE "jobId" = $2`, [embedding, jobId]);
});
const getJob = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = jobId
        ? `SELECT * FROM public."jobTable" WHERE "jobId" = $1;`
        : `SELECT * FROM public."jobTable";`;
    const result = yield (0, database_1.executeSQLQuery)(query, jobId ? [jobId] : []);
    return result.rows;
});
exports.getJob = getJob;
const addJob = (email, companyName, jobTitle, location, phone, salary, deadline, jobType, description, requirement, resposibilities, field, logo) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    INSERT INTO public."jobTable" (
      email, "companyName", "jobTitle", location, phone, salary, 
      deadline, "jobType", description, requirement, 
      resposibilities, field, logo, job_embedding
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
    // Combine relevant fields for embedding
    const jobText = `${jobTitle} ${description} ${requirement} ${field}`;
    console.log(jobText);
    const embedding = yield generateJobEmbedding(jobText);
    // Convert embedding to a format pgvector understands
    const embeddingParam = embedding ?
        JSON.stringify(embedding).replace(/"/g, '') : null;
    console.log('[SERVICE] Final embedding param:', (embeddingParam === null || embeddingParam === void 0 ? void 0 : embeddingParam.substring(0, 50)) + '...');
    const result = yield (0, database_1.executeSQLQuery)(query, [
        email, companyName, jobTitle, location, phone, salary, deadline,
        jobType, description, requirement, resposibilities, field, logo,
        embeddingParam
    ]);
    return result.rows[0];
});
exports.addJob = addJob;
const updateJob = (jobId, email, companyName, jobTitle, location, phone, salary, deadline, jobType, description, requirement, resposibilities, field, logo) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE public."jobTable"
    SET email=$1, "companyName"=$2, "jobTitle"=$3, location=$4, phone=$5, 
        salary=$6, deadline=$7, "jobType"=$8, description=$9, 
        requirement=$10, resposibilities=$11, field=$12, logo=$13
    WHERE "jobId"=$14
    RETURNING *;
  `;
    const result = yield (0, database_1.executeSQLQuery)(query, [
        email, companyName, jobTitle, location, phone, salary, deadline,
        jobType, description, requirement, resposibilities, field, logo, jobId
    ]);
    // Update embedding if relevant fields changed
    const jobText = `${jobTitle} ${description} ${requirement} ${field}`;
    const embedding = yield generateJobEmbedding(jobText);
    if (embedding) {
        yield (0, database_1.executeSQLQuery)(`UPDATE public."jobTable" SET job_embedding = $1 WHERE "jobId" = $2`, [embedding, jobId]);
    }
    return result.rows[0];
});
exports.updateJob = updateJob;
const deleteJob = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM public."jobTable" WHERE "jobId" = $1 RETURNING "jobId";`;
    const result = yield (0, database_1.executeSQLQuery)(query, [jobId]);
    return result.rows[0];
});
exports.deleteJob = deleteJob;
//# sourceMappingURL=index.js.map