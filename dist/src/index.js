"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const router_1 = __importDefault(require("./router"));
const middlewares_1 = __importDefault(require("./middlewares"));
const app = (0, express_1.default)();
(0, middlewares_1.default)(app);
(0, router_1.default)(app);
(0, dotenv_1.config)();
const PORT = process.env.PORT || 5001;
const ENV = process.env.NODE_ENV || "development";
app.listen(PORT, () => console.log(` 📡 Backend server: ` + ` Running in ${ENV} mode on port ${PORT}`));
//# sourceMappingURL=index.js.map