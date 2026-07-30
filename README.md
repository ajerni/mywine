# MyWine.info

A web app for managing your personal wine cellar — track bottles, ratings, notes, and photos, with search, filters, CSV import/export, and optional AI features.

Live at:

[Create your account at mywine.info](https://www.mywine.info)

## Features

- Wine cellar with search, filters, sorting, and customizable table columns
- Bottle details: producer, grapes, region, year, price, quantity, ratings, notes
- Photo uploads (label/cork shots) via ImageKit
- CSV import and export
- Collection dashboard
- AI sommelier chat and wine summaries (Pro)
- User accounts with JWT auth

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Next.js API routes, PostgreSQL, JWT and separate FastAPI backend for AI agents
- **Media:** ImageKit, Sharp
