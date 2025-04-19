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
exports.addInterviewController = exports.getInterviewController = void 0;
const interview_1 = require("../../services/interview");
const getInterviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const jobId = req.query.jobId ? parseInt(req.query.jobId) : undefined;
    try {
        if (jobId && isNaN(jobId)) {
            return res.status(400).json({ error: "Invalid jobId format" });
        }
        const result = yield (0, interview_1.getInterview)(jobId);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedInterviews = result.slice(startIndex, endIndex);
        res.status(200).json({
            data: paginatedInterviews,
            total: result.length,
            page,
            pageSize
        });
    }
    catch (error) {
        console.error("Error fetching jobs:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getInterviewController = getInterviewController;
const addInterviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId, firstName, lastName, email, nationality, seekedSalary, phone, jobType, description, } = req.body;
    try {
        yield (0, interview_1.addInterview)(jobId, firstName, lastName, email, nationality, seekedSalary, phone, jobType, description);
        res.status(200).send("Interview added successfully.");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
});
exports.addInterviewController = addInterviewController;
//# sourceMappingURL=index.js.map