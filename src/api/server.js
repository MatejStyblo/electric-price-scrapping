const express = require('express');
const scrapeData = require('./scrape');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // Middleware pro zpracování JSON dat

app.get('/', (req, res) => {
    res.send('Welcome to the Energy Price Scraper API!');
});

app.get('/api/scrape', async (req, res) => {
    try {
        const data = await scrapeData();
        res.json(data);
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

// Definování POST endpointu pro start-charging
app.post('/api/start-charging', (req, res) => {
    console.log("Start charging request received:", req.body);
    res.json({ message: "Charging started", receivedData: req.body });
});

// Definování POST endpointu pro stop-charging
app.post('/api/stop-charging', (req, res) => {
    console.log("Stop charging request received:", req.body);
    res.json({ message: "Charging stopped", receivedData: req.body });
});

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
