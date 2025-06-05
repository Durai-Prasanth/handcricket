const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());

const MATCH_SUMMARY_FILE = './matchSummary.json';

// Load match summary from file or start fresh
function loadMatchSummary() {
    if (fs.existsSync(MATCH_SUMMARY_FILE)) {
        const data = fs.readFileSync(MATCH_SUMMARY_FILE, 'utf8');
        return JSON.parse(data);
    }
    return { totalMatches: 0, totalWins: 0, highScore: 0, highScorePlayer: "" };
}

// Save match summary to file
function saveMatchSummary(summary) {
    fs.writeFileSync(MATCH_SUMMARY_FILE, JSON.stringify(summary, null, 2));
}

// Get match summary
app.get('/match-summary', (req, res) => {
    const summary = loadMatchSummary();
    res.json(summary);
});

// Update match summary
app.post('/match-summary', (req, res) => {
    const newSummary = req.body;
    if (!newSummary || typeof newSummary !== 'object') {
        return res.status(400).json({ error: 'Invalid match summary data' });
    }
    // For simplicity, just overwrite existing summary
    saveMatchSummary(newSummary);
    res.json({ success: true, summary: newSummary });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
