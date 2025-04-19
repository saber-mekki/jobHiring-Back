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
const { extractCvText } = require('./src/controllers/uploadController');
const path = require('path');
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const testFilePath = path.join(__dirname, 'test_cv.pdf'); // Chemin absolu
            console.log(`Début du test avec: ${testFilePath}`);
            const result = yield extractCvText(testFilePath, 1);
            console.log('Résultat:', result);
        }
        catch (err) {
            console.error('Échec du test:', {
                message: err.message,
                stack: err.stack
            });
        }
    });
}
runTest();
//# sourceMappingURL=testUpload.js.map