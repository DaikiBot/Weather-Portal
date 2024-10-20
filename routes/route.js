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
    max: 5,
    message: 'Too many requests, please try again later.',
});

router.get('/forcast', rateLimiter, async (req, res) => {
    try {
        const location = req.query.location;

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'A valid location query parameter is required.' });
        }

        const { latitude, longitude } = await GetLocation(location);
        const data = await getForecastData(latitude, longitude);
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
        const data = await getForecastData(latitude, longitude);
        res.json({
            location: data.location,
            current: data.current
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/alert', rateLimiter, async (req, res) => {
    try {
        const location = req.query.location;

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'A valid location query parameter is required.' });
        }

        const { latitude, longitude } = await GetLocation(location);
        const data = await getAlertData(latitude, longitude);
        res.json({
            alerts: data.alerts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/astronomy', rateLimiter, async (req, res) => {
    try {
        const location = req.query.location;

        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'A valid location query parameter is required.' });
        }

        const { latitude, longitude } = await GetLocation(location);
        const data = await getAstroData(latitude, longitude);
        res.json({
            astronomy: data.astronomy.astro
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

router.get('/spark', async (req, res) => {
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

async function GetLightning(lat, lon) {
    try {
        const response = await axios.get(`https://api.weather.daiki-bot.xyz/get-lightning-data?lat=${lat}&lon=${lon}`);
        console.log(response.data); // Handle the response
        return response.data;
    } catch (error) {
        console.error('Error fetching lightning data:', error);
        throw error;
    }
}

async function getForecastData(lat, long) {
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

async function getAlertData(lat, long) {
    const weatherApiKey = 'f3b52ac0b10c493198103720231306';
    const weatherApiUrl = `https://api.weatherapi.com/v1/alerts.json?key=f3b52ac0b10c493198103720231306&q=${encodeURIComponent(lat)}, ${encodeURIComponent(long)}`;

    try {
        const weatherApiResponse = await axios.get(weatherApiUrl);
        return weatherApiResponse.data;
    } catch (error) {
        interaction.editReply("Unable to fetch weather data.")
        throw new Error('Failed to fetch weather data.');
    }
}

async function getAstroData(lat, long) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are zero-based, so +1
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const weatherApiKey = 'f3b52ac0b10c493198103720231306';
    const weatherApiUrl = `https://api.weatherapi.com/v1/astronomy.json?key=f3b52ac0b10c493198103720231306&q=${encodeURIComponent(lat)}, ${encodeURIComponent(long)}&t=${formattedDate}`;

    try {
        const weatherApiResponse = await axios.get(weatherApiUrl);
        return weatherApiResponse.data;
    } catch (error) {
        interaction.editReply("Unable to fetch weather data.")
        throw new Error('Failed to fetch weather data.');
    }
}

module.exports = router;