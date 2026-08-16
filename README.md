# Alpivion Network

A flight simulation community site for virtual pilots — group flights, community features, and more.

This is currently a static front-end only. Backend features (accounts, forums, live flight
data, events) will be reintroduced later.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

## Deploying to Cloudflare

Deploys as a Cloudflare Worker with static assets:

- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`
- Configuration lives in `wrangler.jsonc`, which serves `./dist` and handles SPA routing via
  `not_found_handling: "single-page-application"`.
