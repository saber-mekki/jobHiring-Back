"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const express_2 = require("express");
//import morgan from "morgan";
exports.default = (app) => {
    app.use((0, cors_1.default)());
    app.use((0, express_2.json)());
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: false }));
    app.use("/uploads", express_1.default.static("uploads"));
    //app.use(morgan("dev"));
};
//# sourceMappingURL=index.js.map