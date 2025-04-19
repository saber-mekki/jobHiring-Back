const { extractCvText } = require('./src/controllers/uploadController');
const path = require('path');

async function runTest() {
    try {
        const testFilePath = path.join(__dirname, 'test_cv.pdf'); // Chemin absolu
        console.log(`Début du test avec: ${testFilePath}`);
        
        const result = await extractCvText(testFilePath, 1);
        console.log('Résultat:', result);
        
    } catch (err) {
        console.error('Échec du test:', {
            message: err.message,
            stack: err.stack
        });
    }
}

runTest(); 