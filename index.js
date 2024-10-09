console.clear();
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Access-Control-Allow-Origin'], // Include 'Access-Control-Allow-Origin' in allowed headers
    preflightContinue: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");



const APIroutes = require('./routes/route');

app.use('/api', APIroutes)

app.get("/", (req, res) => {
    res.send("Weather Portal API");
});

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});
