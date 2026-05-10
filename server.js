import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Store IP addresses of users who have commented
const commentIPs = new Set();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

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
      paletteId: "diary",
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
        body: "mostly a lazy person idk type shit\nplay celeste it'll turn you into one of us\nyeah i also mod for roblox games who would've thought (alternate battlegrounds!!)\neat grass\n",
        tagsText: "ass sleep schedule, true idiot, sucks at guitar",
        age: "16",
        timezone: "GMT+5",
        showAge: true,
        showTimezone: true,
      },
      nowListText: "still didnt beat farewell\neither in discord or playing guitar\nor sleeping idk\nor not",
      contact: {
        email: "brookerslyn@gmail.com",
        showEmail: true,
        discordId: "647814047210930223",
        showCopyDiscord: true,
        spotifyUrl: "https://open.spotify.com/user/bwgcycadjmtonviwisal8vnp8?si=5c905528ace34b0f",
        steamId: "76561199702812419",
        lastfmUsername: "brookerslyn",
      },
      music: {
        enabled: true,
        volume: 100,
        autoplay: true,
        visual: "cassette",
        crackle: true,
        playlist: [
          { id: "Nmemc-b6cdU", title: "Summer Slack" },
          { id: "bIW0n36TUSQ", title: "Nareai Serve" },
          { id: "WpRcRYoHqxE", title: "DROP" },
        ],
      },
      favorites: {
        games: [
          { emoji: "🍓", label: "celeste", note: "still on farewell", imageUrl: "https://media.tenor.com/NjXUcFTS_EkAAAAj/madeline-celeste.gif" },
          { emoji: "★", label: "omori", note: "heh 100% completion in 75 hours", imageUrl: "https://media.tenor.com/Z1iZAJCTQoUAAAAj/mewo.gif" },
          { emoji: "★", label: "deltarune", note: "deltarune tomorrow", imageUrl: "https://i.redd.it/egbnebde4z5f1.gif" },
        ],
        music: [
          { emoji: "🎸", label: "kessoku band", note: "uh yeah its the group from bocchi the rock", imageUrl: "https://i.pinimg.com/originals/48/47/2b/48472b7707470c23b105a68746cd22bb.jpg" },
        ],
        movies: [
          { emoji: "🎬", label: "bocchi the rock", note: "thats surprising i didnt know", imageUrl: "https://m.media-amazon.com/images/I/91tiRtwMXsL.jpg" },
          { emoji: "★", label: "Josee the Tiger and the Fish", note: "goated movie go watch it", imageUrl: "https://blog.alltheanime.com/wp-content/uploads/2022/06/Josee-the-Tiger-and-the-Fish.jpg" },
          { emoji: "★", label: "jojos idk", note: "yeah jojo is peak i didnt watch stone ocean tho", imageUrl: "https://m.media-amazon.com/images/M/MV5BMzIyNzY4NTMtNmVhYS00OWFhLTkwMWMtOGFkNTdmNWU2ZDdiXkEyXkFqcGc@._V1_.jpg" },
        ],
        food: [
          { emoji: "🍜", label: "honestly no idea what to put here", note: "yeah no shit i dont know", imageUrl: "" },
        ],
      },
      guestbook: [],
      stickers: [
        { id: "67y4z1fp", emoji: "🌱", label: "madeline", imageUrl: "https://i.pinimg.com/originals/1c/9d/6c/1c9d6c8981fe59b7627dfd078f965d7f.gif" },
      ],
      recent: [],
      comments: [],
      portfolio: [
        { id: "bi9xgtrs", title: "brookerslyn.space", blurb: "personal bio website idk", tag: "web", emoji: "", imageUrl: "https://files.catbox.moe/ksr484.png", url: "https://www.brookerslyn.space/" },
      ],
      guitarCovers: [],
      stickyNote: {
        enabled: false,
        text: "not the final version\n",
      },
      marqueeText: "touch grass • eat grass • git gud",
      footer: {
        headline: "see ya",
        sub: "or not",
        bottom: "brook",
        transFlairText: "TRANS PEOPLE CAN DOUBLE JUMP",
        showTransFlair: true,
      },
      features: {
        cursor: false,
        hearts: true,
        sparkles: true,
        marquee: true,
        music: true,
        transFlair: true,
        paperGrain: true,
        confetti: true,
        konami: true,
        polaroidFlip: true,
        spotify: true,
      },
      sectionOrder: [
        "hero", "marquee", "about", "now", "connections", "recent", "favorites", "guestbook", "stickers", "steam", "footer"
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

// Catch-all handler for React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Config server running on http://localhost:${PORT}`);
  console.log(`Config file: ${CONFIG_FILE}`);
});
