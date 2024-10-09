const express = require('express')
const router = express.Router();
const axios = require('axios')

router.get('/spark/:lat/:long', async (req, res) => {
    const data = await GetLightning(req.params.lat, req.params.long);
    res.json(data);
})

function GetLightning(lat, long) {
    const { spawn } = require('child_process');

    // Separate the script and the arguments
    const pythonProcess = spawn('py', ['./spark.py', `${lat}`, `${long}`]);
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(`${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error from Python script: ${data}`);
    });
}

