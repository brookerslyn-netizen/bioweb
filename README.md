# brookerslyn

A personal bio website with admin panel, comments, and real-time multi-user updates.

## Features

- 🎨 **Multiple Themes**: Forest, Pink Dream, Crimson, Aqua, Diary, Violet Dust
- 🖼️ **Image Support**: Replace emojis with real images in favorites, stickers, and recent items
- 💬 **Comments System**: IP-limited comments (1 per visitor)
- 👥 **Multi-User**: Real-time updates across all users
- ⚙️ **Admin Panel**: Full content management with authentication
- 🎵 **Music Player**: YouTube playlist integration
- 🎮 **Steam Integration**: Game showcase
- 📱 **Responsive**: Works on all devices

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend server (in another terminal)
node server.js
```

### Environment
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Admin: `http://localhost:5173/?admin=brooksecretpasswordwow`

## Deployment

### Railway (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/brookerslyn.git
git push -u origin main
```

2. **Deploy on Railway**
- Go to [railway.app](https://railway.app)
- Connect your GitHub repository
- Railway will auto-detect and deploy your app
- Set environment variable: `NODE_ENV=production`

### Manual Deployment

1. **Build the app**
```bash
npm run build
```

2. **Start production server**
```bash
NODE_ENV=production node server.js
```

## Configuration

The app uses a `config.json` file for storage. In production, this is managed automatically.

## Admin Features

- **Themes**: Switch between 6 built-in themes
- **Content**: Edit all text, links, and sections
- **Images**: Add image URLs to replace emojis
- **Music**: Manage YouTube playlist
- **Layout**: Reorder sections
- **Features**: Enable/disable interactive elements

## API Endpoints

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration (admin only)
- `POST /api/comments` - Submit comment
- `GET /api/health` - Health check

## License

MIT
