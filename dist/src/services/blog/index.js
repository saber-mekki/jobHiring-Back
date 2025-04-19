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
exports.updateBlog = exports.deleteBlog = exports.addBlog = exports.getBlog = void 0;
const database_1 = require("../../database");
const getBlog = (blogId) => __awaiter(void 0, void 0, void 0, function* () {
    let query;
    if (!blogId) {
        query = 'SELECT * FROM public."blogTable";';
    }
    else {
        query = `SELECT * FROM public."blogTable" WHERE "blogId" = '${blogId}';`;
    }
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows;
});
exports.getBlog = getBlog;
const addBlog = (blogAuthor, blogTitle, blogDate, blogContent, blogImage) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `INSERT INTO public."blogTable"("blogAuthor", "blogTitle", "blogDate" ,"blogContent"  ,"blogImage" )
     VALUES ('${blogAuthor}','${blogTitle}','${blogDate}','${blogContent}','${blogImage}')`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.addBlog = addBlog;
const deleteBlog = (blogId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE  FROM public."blogTable" WHERE "blogId"='${blogId}' returning "blogId"`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.deleteBlog = deleteBlog;
const updateBlog = (blogId, blogAuthor, blogTitle, blogDate, blogContent, blogImage) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `UPDATE public."blogTable"
                   SET "blogAuthor"='${blogAuthor}', "blogTitle"='${blogTitle}', "blogDate"='${blogDate}',
                       "blogContent"='${blogContent}', "blogImage"='${blogImage}'
                   WHERE "blogId"='${blogId}' RETURNING *;`;
    const result = yield (0, database_1.executeSQLQuery)(query);
    return result.rows[0];
});
exports.updateBlog = updateBlog;
//# sourceMappingURL=index.js.map