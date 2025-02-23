import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

let blessingsCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000;

app.use(express.static(path.join(__dirname, '../public')));

async function loadBlessings() {
    const currentTime = Date.now();

    if (blessingsCache && (currentTime - lastCacheUpdate) < CACHE_DURATION) {
        return blessingsCache;
    }

    try {
        const blessingsFile = await fs.readFile(
            path.join(__dirname, '../data/blessings.json'),
            'utf8'
        );
        blessingsCache = JSON.parse(blessingsFile);
        lastCacheUpdate = currentTime;
        return blessingsCache;
    } catch (error) {
        console.error('Error loading blessings:', error);
        throw error;
    }
}

app.get('/api/blessings', async (req, res) => {
    try {
        const blessings = await loadBlessings();
        res.json(blessings);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to load blessings',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});