const express = require('express');
const router = express.Router();
const axios = require('axios')
const { spawn } = require('child_process');
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'openstreetmap',
    headers: {
        'User-Agent': 'WeatherPortalDaikiDevelopment/1.0',
        "Referrer": "https://daiki-bot.xyz",
    }
};

const geocoder = NodeGeocoder(options);

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 1000,
    max: 1,
    message: 'Too many requests, please try again later.',
});

router.get('/forcast', rateLimiter, async (req, res) => {
    try {
        const location = req.query.location;

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'A valid location query parameter is required.' });
        }

        const { latitude, longitude } = await GetLocation(location);
        const data = await getWeatherData(latitude, longitude);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/forcast/current', rateLimiter, async (req, res) => {
    try {
        const location = req.query.location;

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'A valid location query parameter is required.' });
        }

        const { latitude, longitude } = await GetLocation(location);
        const data = await getWeatherData(latitude, longitude);
        res.json({
            location: data.location,
            current: data.current
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/spark/', async (req, res) => {
    try {
        const location = req.query.location;

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'A valid location query parameter is required.' });
        }

        const { latitude, longitude } = await GetLocation(location);
        const data = await GetLightning(latitude, longitude);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


async function GetLocation(location) {
    if (!location || typeof location !== 'string') {
        throw new Error('A valid address string is required');
    }

    const geoRes = await geocoder.geocode(location);

    if (geoRes.length === 0) {
        throw new Error('No results found for the provided address');
    }

    const { latitude, longitude } = geoRes[0];
    return { latitude, longitude };
}

function GetLightning(lat, long) {
    const { spawn } = require('child_process');

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
                try {
                    const jsonResult = JSON.parse(result.trim());
                    resolve(jsonResult);
                } catch (error) {
                    reject(`Failed to parse JSON: ${error.message}`);
                }
            } else {
                reject(`Python script exited with code ${code}`);
            }
        });
    });
}

async function getWeatherData(lat, long) {
    const weatherApiKey = 'f3b52ac0b10c493198103720231306';
    const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=f3b52ac0b10c493198103720231306&q=${encodeURIComponent(lat)}, ${encodeURIComponent(long)}`;

    try {
        const weatherApiResponse = await axios.get(weatherApiUrl);
        return weatherApiResponse.data;
    } catch (error) {
        interaction.editReply("Unable to fetch weather data.")
        throw new Error('Failed to fetch weather data.');
    }
}

module.exports = router;