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
exports.getApplicantRanking = exports.getJobRecommendations = void 0;
const database_1 = require("../../database");
const pgvector_1 = __importDefault(require("pgvector"));
// services/ai/matchingService.ts
const cleanEmbedding = (raw) => {
    const arr = Array.isArray(raw)
        ? raw
        : raw.toString().replace(/[{}]/g, "").split(",").map(Number); // Convert string to array
    return arr.map((val) => {
        const num = Number(val);
        if (isNaN(num))
            return 0;
        if (num > 1)
            return 1;
        if (num < -1)
            return -1;
        return num;
    });
};
const validateAndConvertEmbedding = (embedding) => {
    if (typeof embedding === 'string') {
        return embedding.replace(/[{}]/g, "").split(",").map(Number);
    }
    if (!Array.isArray(embedding)) {
        throw new Error('Invalid embedding format: Expected array or parsable string');
    }
    return embedding;
};
const getJobRecommendations = (applicantId, limit = 10) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const applicantResult = yield (0, database_1.executeSQLQuery)('SELECT cv_embedding FROM applicant WHERE user_id = $1', [applicantId]);
    const rawEmbedding = (_a = applicantResult.rows[0]) === null || _a === void 0 ? void 0 : _a.cv_embedding;
    console.log('Raw embedding type:', typeof rawEmbedding, 'value:', rawEmbedding);
    if (!rawEmbedding) {
        throw new Error('Applicant CV embedding not found');
    }
    const cvEmbedding = validateAndConvertEmbedding(rawEmbedding);
    console.log('Processed embedding:', cvEmbedding);
    const result = yield (0, database_1.executeSQLQuery)(`SELECT "jobId", "jobTitle", companyName, description,
      (job_embedding <=> $1) as similarity_score
     FROM public."jobTable"
     ORDER BY similarity_score ASC
     LIMIT $2`, [pgvector_1.default.toSql(cvEmbedding), limit]);
    return result.rows.map(row => (Object.assign(Object.assign({}, row), { match_score: Math.round((1 - row.similarity_score) * 100) })));
});
exports.getJobRecommendations = getJobRecommendations;
const getApplicantRanking = (jobId, limit = 50) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const jobResult = yield (0, database_1.executeSQLQuery)('SELECT job_embedding FROM public."jobTable" WHERE "jobId" = $1', [jobId]);
    const rawEmbedding = (_b = jobResult.rows[0]) === null || _b === void 0 ? void 0 : _b.job_embedding;
    console.log('Raw job embedding type:', typeof rawEmbedding, 'value:', rawEmbedding);
    if (!rawEmbedding) {
        throw new Error('Job embedding not found');
    }
    const jobEmbedding = validateAndConvertEmbedding(rawEmbedding);
    const result = yield (0, database_1.executeSQLQuery)(`SELECT a.user_id, u.name, a.cv,
      (a.cv_embedding <=> $1) as similarity_score
     FROM applicant a
     JOIN public."userTable" u ON a.user_id = u.id
     ORDER BY similarity_score ASC
     LIMIT $2`, [pgvector_1.default.toSql(jobEmbedding), limit]);
    return result.rows.map(row => (Object.assign(Object.assign({}, row), { match_score: Math.round((1 - row.similarity_score) * 100) })));
});
exports.getApplicantRanking = getApplicantRanking;
//# sourceMappingURL=matching.js.map