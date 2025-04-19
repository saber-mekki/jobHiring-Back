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
exports.addInterview = exports.getInterview = void 0;
const database_1 = require("../../database");
const getInterview = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT * FROM public."interviewTable" WHERE "jobId" = ${jobId};`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows; // Retourner les résultats
});
exports.getInterview = getInterview;
const addInterview = (jobId, firstName, lastName, email, nationality, seekedSalary, phone, jobType, description) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `INSERT INTO public."interviewTable"
        ("jobId", "firstName", "lastName", "email", "nationality", "seekedSalary", "phone", "jobType", "description") 
        VALUES (${jobId}, '${firstName}', '${lastName}', '${email}', '${nationality}', '${seekedSalary}', '${phone}', '${jobType}', '${description}')
        RETURNING "interviewId";`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.addInterview = addInterview;
//# sourceMappingURL=index.js.map