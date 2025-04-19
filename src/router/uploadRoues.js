const express = require('express');
const multer = require('multer');
const { extractCvText } = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Stocke les fichiers temporairement

router.post('/upload-cv', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }

        const text = await extractCvText(req.file.path);
        res.json({ message: 'CV analysé avec succès', extractedText: text });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l extraction du CV', details: error.message });
    }
});

module.exports = router;
