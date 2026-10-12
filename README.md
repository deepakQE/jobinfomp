This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CSS architecture

The app uses CSS Modules as its only component styling system. `app/globals.css` contains design tokens, light and dark theme variables, the minimal reset, base element styles, and accessibility utilities only.

Shared primitives live in `components/ui/` (`Button`, `Badge`, `Container`, and `Skeleton`). Components and route sections keep their styles beside their implementation, for example `Header.jsx` with `Header.module.css` and `app/job/[slug]/page.jsx` with `page.module.css`. This keeps selectors scoped and makes responsive behavior local to the feature that owns it.

Tailwind and its PostCSS integration were removed because no runtime code depends on them after the migration.

## Structure

- `app/`: server-rendered routes, route metadata, loading, error, and not-found states
- `components/`: reusable UI, navigation, rows, sections, and client interactions
- `lib/`: environment, Supabase, and data formatters
- `services/`: database-facing listing logic
- `tests/`: Vitest coverage for shared listing behavior
