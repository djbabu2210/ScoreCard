import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  DB_PATH,
  getAllTournaments,
  saveAllTournaments,
  getAllTeams,
  saveAllTeams,
  getAllMatches,
  saveAllMatches,
  saveSingleMatch,
  getSetting,
  setSetting,
  getDbStats,
  resetDatabase,
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health / status endpoint
app.get('/api/health', (req, res) => {
  try {
    const stats = getDbStats();
    res.json({
      status: 'ok',
      engine: 'SQLite 3 (better-sqlite3)',
      database: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download raw SQLite database file
app.get('/api/sqlite/download', (req, res) => {
  try {
    res.download(DB_PATH, 'cricket.db');
  } catch (err) {
    res.status(500).json({ error: 'Failed to download SQLite database' });
  }
});

// Tournaments
app.get('/api/tournaments', (req, res) => {
  try {
    const data = getAllTournaments();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tournaments', (req, res) => {
  try {
    const tournaments = req.body;
    if (Array.isArray(tournaments)) {
      saveAllTournaments(tournaments);
      res.json({ success: true, count: tournaments.length });
    } else {
      res.status(400).json({ error: 'Expected array of tournaments' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teams
app.get('/api/teams', (req, res) => {
  try {
    const data = getAllTeams();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', (req, res) => {
  try {
    const teams = req.body;
    if (Array.isArray(teams)) {
      saveAllTeams(teams);
      res.json({ success: true, count: teams.length });
    } else {
      res.status(400).json({ error: 'Expected array of teams' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Matches
app.get('/api/matches', (req, res) => {
  try {
    const data = getAllMatches();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/matches', (req, res) => {
  try {
    const matches = req.body;
    if (typeof matches === 'object' && matches !== null) {
      // Check if it's a map or single match
      if (matches.id) {
        saveSingleMatch(matches);
      } else {
        saveAllMatches(matches);
      }
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid matches payload' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/matches/:id', (req, res) => {
  try {
    const match = req.body;
    if (match && match.id) {
      saveSingleMatch(match);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid match data' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Active match ID
app.get('/api/active-match-id', (req, res) => {
  try {
    const activeId = getSetting('activeMatchId', 'match_demo_1');
    res.json({ activeMatchId: activeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/active-match-id', (req, res) => {
  try {
    const { activeMatchId } = req.body;
    setSetting('activeMatchId', activeMatchId || '');
    res.json({ success: true, activeMatchId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset database
app.post('/api/reset', (req, res) => {
  try {
    const { tournaments, teams, matches, activeMatchId } = req.body;
    resetDatabase(tournaments || [], teams || [], matches || {}, activeMatchId || 'match_demo_1');
    res.json({ success: true, message: 'SQLite database reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static assets in production (Render, Docker, VPS)
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  // Catch-all fallback for SPA client-side routing (Express 5 compatible)
  app.use((req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[SQLite API Server] Running on http://localhost:${PORT}`);
  console.log(`[SQLite Storage] DB file: ${DB_PATH}`);
});

