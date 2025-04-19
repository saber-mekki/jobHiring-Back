const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

async function extractCvText(filePath, userId) {
  const pythonPath = filePath.replace(/\\/g, '/');
    
  return new Promise((resolve, reject) => {
      console.log(`[DEBUG] Final Python file path: ${pythonPath}`);
      
      const pythonProcess = spawn('python', [
          path.join(__dirname, '../services/ai/cv_processing.py'),
          JSON.stringify({ 
              file_path: pythonPath, 
              user_id: userId 
          })
      ]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[PYTHON STDOUT] ${data.toString().trim()}`);
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[PYTHON STDERR] ${data.toString().trim()}`);
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            console.log(`[DEBUG] Python process exited with code ${code}`);
            
            try {
                if (code !== 0) {
                    throw new Error(`Python script failed with code ${code}. Error: ${stderrData}`);
                }
        
                console.log(`[DEBUG] Raw stdout length: ${stdoutData.length}`);
                console.log(`[DEBUG] Raw stdout (first 200 chars): ${stdoutData.substring(0, 200)}`);
                
                const cleanedData = stdoutData.trim();
                
                if (!cleanedData) {
                    throw new Error('Python script returned empty response');
                }
        
                console.log(`[DEBUG] Attempting to parse: ${cleanedData.substring(0, 100)}...`);
                const result = JSON.parse(cleanedData);
                
                // DEBUG: Check the embedding structure
                console.log('[DEBUG] Embedding type:', typeof result.embedding);
                console.log('[DEBUG] Is array?', Array.isArray(result.embedding));
                if (result.embedding) {
                    console.log('[DEBUG] First 5 embedding values:', result.embedding.slice(0, 5));
                    console.log('[DEBUG] Embedding length:', result.embedding.length);
                }
                
                if (result.error) {
                    throw new Error(result.error);
                }
                
                console.log('[DEBUG] Successfully parsed JSON');
                resolve(result);
            } catch (err) {
                console.error('[ERROR] Failed to process Python output:', err.message);
                reject(new Error(`Failed to process CV: ${err.message}`));
            }
        });
    });
}

exports.processCV = async (req, res) => {
    let filePath;
    try {
        console.log('[DEBUG] Starting CV processing');
        
        const { user_id } = req.body;
        const file = req.files.cv;
        
        const uploadDir = path.join(__dirname, '../../uploads');
        filePath = path.join(uploadDir, `${Date.now()}_${file.name}`);
        
        console.log(`[DEBUG] Saving file to ${filePath}`);
        await file.mv(filePath);

        console.log('[DEBUG] Calling extractCvText');
        const result = await extractCvText(filePath, user_id);
        
        console.log('[DEBUG] Cleaning up temporary file');
        await fs.unlink(filePath).catch(console.error);

        console.log('[DEBUG] Sending successful response');
        res.json({
            success: true,
            message: 'CV processed successfully',
            embedding: result.embedding
        });

    } catch (err) {
        console.error('[ERROR] CV processing failed:', err);
        
        if (filePath) {
            console.log('[DEBUG] Attempting to clean up temporary file after error');
            await fs.unlink(filePath).catch(console.error);
        }
        
        res.status(500).json({ 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};


exports.extractCvText = extractCvText;