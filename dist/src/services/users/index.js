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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.addUser = exports.getUser = void 0;
const database_1 = require("../../database");
const getUser = (login) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT * FROM public."userTable" WHERE login = $1`;
    const result = yield (0, database_1.executeSQLQuery)(query, [login]);
    return result.rows;
});
exports.getUser = getUser;
const addUser = (userData, client) => __awaiter(void 0, void 0, void 0, function* () {
    const { login, password, phone, gender, name, registerType, image, companyName, location, cv, skills, experience, education, cv_embedding } = userData;
    try {
        const executeQuery = client ? client.query.bind(client) : database_1.executeSQLQuery;
        // Insert user
        const userQuery = `
      INSERT INTO public."userTable" (
        login, password, phone, gender, name, "registerType", image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`;
        const userValues = [login, password, phone, gender, name, registerType, image];
        const userResult = yield executeQuery(userQuery, userValues);
        if (userResult.rows.length === 0)
            throw new Error("User insertion failed");
        const userId = userResult.rows[0].id;
        // Insert role-specific data
        if (registerType === "recruiter") {
            const recruiterQuery = `
        INSERT INTO public.recuiter (user_id, "companyName", location)
        VALUES ($1, $2, $3)`;
            yield executeQuery(recruiterQuery, [userId, companyName, location]);
        }
        if (registerType === "applicant") {
            const applicantQuery = `
        INSERT INTO public.applicant (
          user_id, cv, skills, experience, education, cv_embedding
        ) VALUES ($1, $2, $3, $4, $5, $6::vector)`;
            // Convert embedding to a format pgvector understands
            const embeddingParam = cv_embedding ?
                JSON.stringify(cv_embedding).replace(/"/g, '') : null;
            console.log('[SERVICE] Final embedding param:', (embeddingParam === null || embeddingParam === void 0 ? void 0 : embeddingParam.substring(0, 50)) + '...');
            yield executeQuery(applicantQuery, [
                userId,
                cv,
                skills,
                JSON.stringify(experience),
                JSON.stringify(education),
                embeddingParam
            ]);
        }
        return { success: true, userId };
    }
    catch (error) {
        console.error("Error in addUser:", error);
        throw error;
    }
});
exports.addUser = addUser;
const deleteUser = (login) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    DELETE FROM public."userTable" 
    WHERE login = $1 
    RETURNING id, login`;
    const result = yield (0, database_1.executeSQLQuery)(query, [login]);
    return result.rows[0];
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=index.js.map