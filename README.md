# Context Duel

A fast, real-time two-player word closeness game running with zero runtime npm dependencies.

Take turns guessing the secret word. Every guess is scored based on semantic similarity using word vector embeddings (rank 1 is the hidden secret word). The first player to guess the exact word wins!

## Features

- **Multiplayer & Solo Modes**: Play with a friend via 4-letter room codes or practice solo.
- **Difficulty Levels**: Easy, Medium, and Hard word pools.
- **Smart Hints**: Hints guide players toward closer words without spoiling words below rank 2.
- **Zero NPM Dependencies**: Runs entirely on native Node.js standard libraries (`http`, `fs`, `path`).
- **Low Footprint & Secure**: Built-in rate limiting per IP, strict path traversal validation, and security HTTP headers (`nosniff`, `DENY` clickjacking protection, referrer privacy).

## Project Structure

```
.
├── server.js          # HTTP game server and ranking engine (native Node.js)
├── package.json       # Project metadata and start script
├── .env.example       # Example environment variables
├── .gitignore         # Ignores sensitive keys, env files, and OS artifacts
├── build_data.py      # Data generation script using GloVe embeddings (optional)
├── public/
│   └── index.html     # Client single-page application (HTML, CSS, JS)
└── data/
    ├── words.txt      # 30,000 vocabulary words
    ├── vectors.bin    # 100-dimensional quantized word vectors (~3 MB)
    └── secrets.json   # Dictionary of secret target words per difficulty
```

> **Note on `data/secrets.json`**: This file contains the word lists (target puzzle answers such as "ocean" or "bridge"), not sensitive credentials or API keys. Keep this file tracked in git so deployments can run out of the box.

## Getting Started

### Prerequisites

- Node.js 18 or newer

### Local Development

1. Clone or download this repository.
2. Start the server:
   ```bash
   node server.js
   ```
3. Open your browser at `http://localhost:3000`.

### Environment Configuration

You can configure runtime settings via environment variables (or copy `.env.example` to `.env` if using a local manager):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the HTTP server |
| `RATE_LIMIT` | `600` | Maximum requests per minute per IP |

## Deploying to Production

The server requires a Node.js runtime environment.

### Deploying to Render

1. Push your repository to GitHub.
2. In [Render](https://render.com), create a new **Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Runtime**: `Node`
   - **Build Command**: *(leave empty)*
   - **Start Command**: `node server.js`
5. Click **Deploy**.

## Pushing to GitHub

To publish this project to a new GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit: Context Duel game"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
git push -u origin main
```

## License

This project is licensed under the MIT License.
