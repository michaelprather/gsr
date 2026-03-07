<p align="center">
  <img src="public/icon.svg" alt="George Street Rummy" width="120" height="120">
</p>

# George Street Rummy Scorekeeper

Mobile-first, offline-capable scorekeeper for George Street Rummy.

## Features

- **7-Round Scoring** - Track scores across all rounds with progressive book/run requirements
- **Quick Actions** - Crown button to mark round winners, skip players who leave mid-game
- **Standings** - Portrait list view or landscape scorecard showing all rounds
- **Game Sharing** - Share games via QR code or link for multi-device play
- **Offline Support** - Full PWA with IndexedDB persistence, works without internet
- **Built-in Help** - Complete rules reference and app usage guide

## Game Rules

George Street Rummy is played over 7 rounds with 11 cards dealt each round. The player with the **lowest total score** wins.

| Round | Requirement |
|-------|-------------|
| 1 | 2 Books |
| 2 | 1 Book + 1 Run |
| 3 | 2 Runs |
| 4 | 3 Books |
| 5 | 2 Books + 1 Run |
| 6 | 2 Runs + 1 Book |
| 7 | 3 Runs |

**Scoring:** Number cards = face value, Face cards = 10, Aces = 15, Jokers = 25. Round winner scores 0.

## Development

```sh
pnpm install    # Install dependencies
pnpm dev        # Start dev server
pnpm build      # Build for production
pnpm test:unit  # Run tests
```

## Tech Stack

Vue 3 + TypeScript + Vite + Vue Router + Vitest + vite-plugin-pwa

## Deployment

Requires Docker and Docker Compose.

### Build

```sh
# Build for the target platform (e.g. linux/amd64)
docker buildx build --platform linux/amd64 -t gsr:latest --output type=docker,dest=gsr.tar .

# Copy the image and docker-compose.yml to the server
scp gsr.tar docker-compose.yml username@server:~/gsr/
```

### Run

On the server, load the image and start the stack:

```sh
docker load -i gsr.tar
docker compose up -d
```

Create a `.env` file alongside `docker-compose.yml` with the required environment variables:

```
CLOUDFLARE_TUNNEL_TOKEN=<your-token>
```

The app will be available on port 3000. To use a different port, change the port mapping in `docker-compose.yml`.
