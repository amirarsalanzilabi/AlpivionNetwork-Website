# Alpivion Network

A flight simulation community site for virtual pilots — group flights, forums, events, and more.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

## Environment variables

This project uses Supabase. Copy `.env.example` to `.env` and fill in your project's values:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

## Deploying to Cloudflare Pages

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Environment variables**: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` under the project's Settings → Environment Variables.
- A `public/_redirects` file is included so client-side routes (e.g. `/dashboard`, `/forums`) don't 404 on refresh.
