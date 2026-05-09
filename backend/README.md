# Brookerslyn Backend API

Node.js/Express backend for the brookerslyn bio website.

## Features

- Config management and persistence
- Comments API with IP rate limiting
- CORS enabled for frontend integration
- Health check endpoint

## Deployment

This backend is designed to be deployed on Railway, Render, or any Node.js hosting service.

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Set to `production` for production

### API Endpoints

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `POST /api/comments` - Submit comment (1 per IP)
- `GET /api/health` - Health check

## Local Development

```bash
cd backend
npm install
npm start
```

Server will run on `http://localhost:3001`
