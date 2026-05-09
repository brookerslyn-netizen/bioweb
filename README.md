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
cd backend
npm install
npm start
```

### Environment
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Admin: `http://localhost:5173/?admin=brooksecretpasswordwow`

## Deployment

### Vercel (Recommended for Frontend)

1. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Vercel will auto-detect and deploy the React app
   - Set environment variable: `VITE_API_URL=your-backend-url`

2. **Deploy Backend to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder as the root directory
   - Set environment variable: `NODE_ENV=production`
   - Copy the Railway URL

3. **Connect Frontend to Backend**
   - Go to your Vercel project settings
   - Add environment variable: `VITE_API_URL=https://your-backend-url.railway.app/api`
   - Redeploy the Vercel project

### Alternative: All-in-One on Railway

1. **Deploy everything on Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will auto-detect and deploy
   - Set environment variable: `NODE_ENV=production`

## Configuration

The app uses a `config.json` file for storage. In production, this is managed automatically by the backend.

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

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **Hosting**: Vercel (frontend) + Railway (backend)
- **Database**: JSON file storage

## License

MIT
