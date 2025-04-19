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
const express = require('express');
const multer = require('multer');
const { extractCvText } = require('../controllers/uploadController');
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Stocke les fichiers temporairement
router.post('/upload-cv', upload.single('cv'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }
        const text = yield extractCvText(req.file.path);
        res.json({ message: 'CV analysé avec succès', extractedText: text });
    }
    catch (error) {
        res.status(500).json({ error: 'Erreur lors de l extraction du CV', details: error.message });
    }
}));
module.exports = router;
//# sourceMappingURL=uploadRoues.js.map