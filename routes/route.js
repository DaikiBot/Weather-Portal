const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Route to handle lightning data request
router.get('/spark/:lat/:long', async (req, res) => {
    try {
        const data = await GetLightning(req.params.lat, req.params.long);
        res.json(data);  // Send the processed data to the client
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to run the Python script
function GetLightning(lat, long) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('py', ['./spark.py', lat, long]);

        let result = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error from Python script: ${data}`);
            reject(`Error from Python script: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(result);
            } else {
                reject(`Python script exited with code ${code}`);
            }
        });
    });
}

module.exports = router;  // Export the router
