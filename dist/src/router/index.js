"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const comment_1 = __importDefault(require("./comment"));
const users_1 = __importDefault(require("./users"));
const jobs_1 = __importDefault(require("./jobs"));
const interviews_1 = __importDefault(require("./interviews"));
const blog_1 = __importDefault(require("./blog"));
const matching_1 = __importDefault(require("./matching"));
exports.default = (app) => {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Rayen API",
                version: "1.0.0",
                description: "This page is dedicated to the route list in the application",
            },
            servers: [
                {
                    url: "http://localhost:" + process.env.PORT + "/api/v1",
                },
            ],
        },
        apis: [
            `${__dirname}/*${path_1.default.extname(path_1.default.basename(__filename))}`,
            `${__dirname}/*/*${path_1.default.extname(path_1.default.basename(__filename))}`,
            `${__dirname}/*/*/*${path_1.default.extname(path_1.default.basename(__filename))}`,
            `${__dirname}/*/*/*/*${path_1.default.extname(path_1.default.basename(__filename))}`,
            `${__dirname}/*/*/*/*/*${path_1.default.extname(path_1.default.basename(__filename))}`,
            `${__dirname}/*/*/*/*/*/*${path_1.default.extname(path_1.default.basename(__filename))}`,
        ],
    };
    const specs = (0, swagger_jsdoc_1.default)(options);
    app.use("/api/v1/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
    app.get("/", (req, res) => {
        res.json({ message: "API Running ! " });
    });
    app.use("/api/v1/", [users_1.default, jobs_1.default, interviews_1.default, blog_1.default, comment_1.default, matching_1.default]);
};
//# sourceMappingURL=index.js.map