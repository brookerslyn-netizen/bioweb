import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Store IP addresses of users who have commented
const commentIPs = new Set();

// Middleware
app.use(cors());
app.use(express.json());

// Get client IP address
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

// Helper functions
async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default config
    const defaultConfig = {
      paletteId: "forest",
      customPalettes: [],
      bgUrl: "",
      hero: {
        name: "brook",
        handle: "@brookerslyn",
        subtitle: "chronically dumb",
        typingLinesText: "touch grass\neat grass",
        scrollHint: "scroll for screamers",
        splashText: "click to steal your data",
        showSparkles: false,
      },
      about: {
        title: "about me",
        body: "mostly a lazy person idk type shit\nplay celeste it'll turn you into one of us",
        tagsText: "ass sleep schedule, true idiot, sucks at guitar",
        age: "16",
        timezone: "GMT+5",
        showAge: true,
        showTimezone: true,
      },
      nowListText: "still didnt beat farewell\neither in discord or playing guitar\nor sleeping idk",
      contact: {
        email: "brookerslyn@gmail.com",
        showEmail: true,
        discordId: "647814047210930223",
        showCopyDiscord: true,
        spotifyUrl: "https://open.spotify.com/user/bwgcycadjmtonviwisal8vnp8?si=5c905528ace34b0f",
        steamId: "",
      },
      music: {
        enabled: true,
        volume: 50,
        autoplay: true,
        visual: "vinyl",
        crackle: true,
        playlist: [{ id: "3IpM7RK0GeY", title: "track 1" }],
      },
      favorites: {
        games: [{ emoji: "🍓", label: "celeste", note: "still on farewell", imageUrl: "" }],
        music: [{ emoji: "🎸", label: "edit me", note: "from the admin panel", imageUrl: "" }],
        movies: [{ emoji: "🎬", label: "edit me", note: "from the admin panel", imageUrl: "" }],
        food: [{ emoji: "🍜", label: "edit me", note: "from the admin panel", imageUrl: "" }],
      },
      guestbook: [],
      stickers: [],
      recent: [],
      stuffIMade: [],
      comments: [],
      stickyNote: {
        enabled: false,
        text: "edit this note from the admin panel",
      },
      marqueeText: "touch grass • eat grass • git gud",
      footer: {
        headline: "see ya",
        sub: "",
        bottom: "",
        transFlairText: "TRANS PEOPLE CAN DOUBLE JUMP",
        showTransFlair: true,
      },
      features: {
        cursor: true,
        hearts: false,
        sparkles: false,
        marquee: true,
        music: true,
        transFlair: true,
        paperGrain: true,
        confetti: true,
        konami: true,
        polaroidFlip: true,
      },
      sectionOrder: [
        "hero", "marquee", "about", "now", "connections", "recent", "favorites", "guestbook", "stickers", "steam", "stuffIMade", "footer"
      ],
    };
    await writeConfig(defaultConfig);
    return defaultConfig;
  }
}

async function writeConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// API Routes

// GET config - for all users
app.get('/api/config', async (req, res) => {
  try {
    const config = await readConfig();
    res.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read config' });
  }
});

// POST config - for admin updates
app.post('/api/config', async (req, res) => {
  try {
    const config = req.body;
    await writeConfig(config);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error writing config:', error);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// POST comments - for public comment submission
app.post('/api/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    const clientIP = getClientIP(req);
    
    if (!name || !message || name.trim().length === 0 || message.trim().length === 0) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    // Check if this IP has already commented
    if (commentIPs.has(clientIP)) {
      return res.status(429).json({ error: 'You have already left a comment. One comment per visitor!' });
    }

    const config = await readConfig();
    const newComment = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    config.comments = [newComment, ...(config.comments || [])];
    await writeConfig(config);
    
    // Add this IP to the set of commenters
    commentIPs.add(clientIP);
    
    res.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Config server running on http://${HOST}:${PORT}`);
  console.log(`Config file: ${CONFIG_FILE}`);
});
