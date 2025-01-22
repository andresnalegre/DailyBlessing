import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/blessings', async (req, res) => {
    try {
        const blessingsFile = await fs.readFile(
            path.join(__dirname, '../data/blessings.json'),
            'utf8'
        );
        const blessings = JSON.parse(blessingsFile);
        res.json(blessings);
    } catch (error) {
        res.status(500).json({ error: 'Error loading blessings' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});