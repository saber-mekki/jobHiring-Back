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
exports.updateComment = exports.deleteComment = exports.addComment = exports.getComment = void 0;
const database_1 = require("../../database");
const getComment = (commentBlogId) => __awaiter(void 0, void 0, void 0, function* () {
    let query;
    if (!commentBlogId) {
        query = 'SELECT * FROM public."commentTable";';
    }
    else {
        query = `SELECT * FROM public."commentTable" WHERE "commentBlogId" = '${commentBlogId}';`;
    }
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows;
});
exports.getComment = getComment;
const addComment = (commentAuthor, commentBlogId, commentDate, commentContent, commentAuthorImage) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `INSERT INTO public."commentTable" 
                   ("commentAuthor", "commentBlogId", "commentDate", "commentContent","commentAuthorImage") 
                   VALUES ('${commentAuthor}', '${commentBlogId}', '${commentDate}', '${commentContent}', '${commentAuthorImage}') 
                   RETURNING *;`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.addComment = addComment;
const deleteComment = (commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM public."commentTable" 
                   WHERE "commentId" = '${commentId}' 
                   RETURNING "commentId";`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.deleteComment = deleteComment;
const updateComment = (commentId, commentAuthor, commentDate, commentContent, commentAuthorImage) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `UPDATE public."commentTable"
                   SET "commentAuthor" = '${commentAuthor}', 
                       "commentDate" = '${commentDate}',
                       "commentContent" = '${commentContent}',
                       "commentAuthorImage"= '${commentAuthorImage}'
                   WHERE "commentId" = '${commentId}' 
                   RETURNING *;`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.updateComment = updateComment;
//# sourceMappingURL=index.js.map