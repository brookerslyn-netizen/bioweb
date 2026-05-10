# bioweb backend

Express API for the bio site — config, comments, Spotify proxy, Deezer
artist/cover fallbacks, and YouTube search.

## Persistent storage on Railway

Writable files live under `DATA_DIR`:

- `config.json` — site config (palette, favorites, playlists, etc.)
- `comments.json` — guestbook entries (separate so config uploads can't clobber
  them)

By default the server writes to `DATA_DIR`, resolved in this order:

1. `DATA_DIR` env var (set this if you want a custom path)
2. `RAILWAY_VOLUME_MOUNT_PATH` (auto-set by Railway when a volume is attached)
3. the folder containing `server.js` (ephemeral — wiped on every redeploy)

### Attach a Railway volume (required to keep comments across redeploys)

Without a volume, Railway gives each deploy a fresh container and any file
written at runtime is lost when you push. Comments and config reset every
deploy.

1. In the Railway dashboard, open your backend service.
2. Go to **Settings → Volumes**.
3. **Add a volume**. Mount path `/data` works fine (any path is OK — Railway
   sets `RAILWAY_VOLUME_MOUNT_PATH` for you).
4. Redeploy. The server logs `Data directory: /data` on startup when it's
   using the volume.
5. (Optional) seed the volume with your current `comments.json` by POSTing
   through the admin API or pasting it directly via the Railway shell.

If you prefer a different path, set `DATA_DIR=/some/other/path` as a service
variable — that wins over the auto-detected volume path.
