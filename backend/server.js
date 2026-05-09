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

// Spotify API Configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || '';

// Store IP addresses of users who have commented
const commentIPs = new Set();

// Spotify token storage (in production, use database)
let spotifyTokens = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

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
      "paletteId": "diary",
      "customPalettes": [],
      "bgUrl": "",
      "hero": {
        "name": "brook",
        "handle": "@brookerslyn",
        "subtitle": "chronically dumb",
        "typingLinesText": "touch grass\neat grass",
        "scrollHint": "scroll for screamers",
        "splashText": "click to steal your data",
        "showSparkles": false
      },
      "about": {
        "title": "about me",
        "body": "mostly a lazy person idk type shit\nplay celeste it'll turn you into one of us\nyeah i also mod for roblox games who would've thought (alternate battlegrounds!!)\neat grass\n",
        "tagsText": "ass sleep schedule, true idiot, sucks at guitar",
        "age": "16",
        "timezone": "GMT+5",
        "showAge": true,
        "showTimezone": true
      },
      "nowListText": "still didnt beat farewell\neither in discord or playing guitar\nor sleeping idk\nor not",
      "contact": {
        "email": "brookerslyn@gmail.com",
        "showEmail": true,
        "discordId": "647814047210930223",
        "showCopyDiscord": true,
        "spotifyUrl": "https://open.spotify.com/user/bwgcycadjmtonviwisal8vnp8?si=5c905528ace34b0f",
        "steamId": "76561199702812419"
      },
      "music": {
        "enabled": true,
        "volume": 100,
        "autoplay": true,
        "visual": "cassette",
        "crackle": true,
        "playlist": [
          {
            "id": "Nmemc-b6cdU",
            "title": "Summer Slack"
          },
          {
            "id": "bIW0n36TUSQ",
            "title": "Nareai Serve"
          },
          {
            "id": "WpRcRYoHqxE",
            "title": "DROP"
          }
        ]
      },
      "favorites": {
        "games": [
          {
            "emoji": "🍓",
            "label": "celeste",
            "note": "still on farewell",
            "imageUrl": "https://media.tenor.com/NjXUcFTS_EkAAAAj/madeline-celeste.gif"
          },
          {
            "emoji": "★",
            "label": "omori ",
            "note": "heh 100% completion in 75 hours",
            "imageUrl": "https://media.tenor.com/Z1iZAJCTQoUAAAAj/mewo.gif"
          },
          {
            "emoji": "★",
            "label": "deltarune",
            "note": "dont forget im under your bed",
            "imageUrl": "https://i.redd.it/egbnebde4z5f1.gif"
          }
        ],
        "music": [
          {
            "emoji": "🎸",
            "label": "kessoku band",
            "note": "uh yeah its the group from bocchi the rock",
            "imageUrl": "https://i.pinimg.com/originals/48/47/2b/48472b7707470c23b105a68746cd22bb.jpg"
          }
        ],
        "movies": [
          {
            "emoji": "🎬",
            "label": "bocchi the rock",
            "note": "thats surprising i didnt know",
            "imageUrl": "https://m.media-amazon.com/images/I/91tiRtwMXsL.jpg"
          },
          {
            "emoji": "★",
            "label": "Josee the Tiger and the FIsh",
            "note": "goated movie go watch it",
            "imageUrl": "https://blog.alltheanime.com/wp-content/uploads/2022/06/Josee-the-Tiger-and-the-Fish.jpg"
          },
          {
            "emoji": "★",
            "label": "jojos idk",
            "note": "yeah jojo is peak i didnt watch stone ocean tho",
            "imageUrl": "https://m.media-amazon.com/images/M/MV5BMzIyNzY4NTMtNmVhYS00OWFhLTkwMWMtOGFkNTdmNWU2ZDdiXkEyXkFqcGc@._V1_.jpg"
          }
        ],
        "food": [
          {
            "emoji": "🍜",
            "label": "honestly no idea what to put here",
            "note": "yeah no shit i dont know ",
            "imageUrl": ""
          }
        ]
      },
      "guestbook": [],
      "stickers": [
        {
          "id": "67y4z1fp",
          "emoji": "🌱",
          "label": "madeline",
          "imageUrl": "https://i.pinimg.com/originals/1c/9d/6c/1c9d6c8981fe59b7627dfd078f965d7f.gif"
        }
      ],
      "recent": [],
      "stuffIMade": [
        {
          "emoji": "✨",
          "title": "this bio!",
          "blurb": "yeah its so cool i know guys",
          "tag": "wip",
          "url": ""
        }
      ],
      "comments": [
        {
          "id": "1778327008325",
          "name": "Talking Patzer",
          "message": "rapidly declining mental function",
          "timestamp": "2026-05-09T11:43:28.325Z"
        },
        {
          "id": "1778324940443",
          "name": "Totally not Niko from oneshot",
          "message": "You should play oneshot",
          "timestamp": "2026-05-09T11:09:00.443Z"
        },
        {
          "id": "1778324366081",
          "name": "Not Waffles",
          "message": "Don't sybrookau",
          "timestamp": "2026-05-09T10:59:26.081Z"
        },
        {
          "id": "1778324337424",
          "name": "NOT maple",
          "message": "if larping is your power what are you without it",
          "timestamp": "2026-05-09T10:58:57.424Z"
        },
        {
          "id": "1778323891915",
          "name": "Corrosion",
          "message": "The FitnessGram Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The run",
          "timestamp": "2026-05-09T10:51:31.915Z"
        },
        {
          "id": "1778322182821",
          "name": "Hokyo",
          "message": "Kys",
          "timestamp": "2026-05-09T10:23:02.821Z"
        },
        {
          "id": "1778321188159",
          "name": "real brook",
          "message": "i love grass",
          "timestamp": "2026-05-09T10:06:28.159Z"
        },
        {
          "id": "1778319572270",
          "name": "Mars",
          "message": "Can I have half your paycheck pls",
          "timestamp": "2026-05-09T09:39:32.270Z"
        },
        {
          "id": "1778319378446",
          "name": "Gaster",
          "message": "Collect my aba moves",
          "timestamp": "2026-05-09T09:36:18.446Z"
        },
        {
          "id": "1778318760068",
          "name": "skinwalker brook",
          "message": "I l o v e g r a s s :)\nI l o v e g r a s s :)\nI l o v e g r a s s :)\ng r a s s i s g r e e n .",
          "timestamp": "2026-05-09T09:26:00.068Z"
        },
        {
          "id": "1778317848487",
          "name": "evil brook",
          "message": "i HATE grass!!!",
          "timestamp": "2026-05-09T09:10:48.487Z"
        }
      ],
      "stickyNote": {
        "enabled": true,
        "text": "not the final version\n"
      },
      "marqueeText": "touch grass • eat grass • git gud",
      "footer": {
        "headline": "see ya",
        "sub": "or not",
        "bottom": "brook",
        "transFlairText": "TRANS PEOPLE CAN DOUBLE JUMP",
        "showTransFlair": true
      },
      "features": {
        "cursor": true,
        "hearts": true,
        "sparkles": true,
        "marquee": true,
        "music": true,
        "transFlair": true,
        "paperGrain": true,
        "confetti": true,
        "konami": true,
        "polaroidFlip": true
      },
      "sectionOrder": [
        "hero",
        "marquee",
        "about",
        "now",
        "connections",
        "recent",
        "favorites",
        "guestbook",
        "stickers",
        "steam",
        "stuffIMade",
        "footer"
      ]
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

// Spotify API Routes

// Get Spotify auth URL
app.get('/api/spotify/auth', (req, res) => {
  if (!SPOTIFY_CLIENT_ID) {
    return res.status(500).json({ error: 'Spotify not configured' });
  }
  
  const scope = 'user-read-recently-played';
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}`;
  
  res.json({ authUrl });
});

// Spotify OAuth callback
app.get('/api/spotify/callback', async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }
  
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error });
    }
    
    spotifyTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };
    
    res.json({ success: true, message: 'Spotify connected!' });
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
});

// Refresh Spotify token
async function refreshSpotifyToken() {
  if (!spotifyTokens.refreshToken) return false;
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: spotifyTokens.refreshToken
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Token refresh error:', data.error);
      return false;
    }
    
    spotifyTokens.accessToken = data.access_token;
    spotifyTokens.expiresAt = Date.now() + (data.expires_in * 1000);
    if (data.refresh_token) {
      spotifyTokens.refreshToken = data.refresh_token;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

// Get recently played tracks
app.get('/api/spotify/recent', async (req, res) => {
  if (!spotifyTokens.accessToken) {
    return res.status(401).json({ error: 'Spotify not connected', needsAuth: true });
  }
  
  // Check if token needs refresh
  if (Date.now() >= spotifyTokens.expiresAt - 60000) {
    const refreshed = await refreshSpotifyToken();
    if (!refreshed) {
      return res.status(401).json({ error: 'Token expired', needsAuth: true });
    }
  }
  
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: {
        'Authorization': `Bearer ${spotifyTokens.accessToken}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ error: 'Token expired', needsAuth: true });
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the tracks
    const tracks = data.items.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', '),
      album: item.track.album.name,
      image: item.track.album.images[0]?.url || '',
      playedAt: item.played_at,
      duration: item.track.duration_ms
    }));
    
    res.json({ tracks, connected: true });
  } catch (error) {
    console.error('Error fetching recent tracks:', error);
    res.status(500).json({ error: 'Failed to fetch recent tracks' });
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
