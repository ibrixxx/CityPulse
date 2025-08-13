# City Pulse – Local Events Explorer

City Pulse is an Expo app that lets you discover local events using the Ticketmaster Discovery API. It features event search by keyword and city, detailed event pages, favourites, language toggle (English/Arabic with RTL), a simple profile, and optional mock authentication.

## Setup

1) Install dependencies

```bash
npm install
```

2) Configure API key

Add your Ticketmaster API key to an Expo public env var so it’s accessible at runtime:

```bash
echo "EXPO_PUBLIC_TICKETMASTER_API_KEY=YOUR_KEY_HERE" > .env
```

Expo automatically loads `.env` for `EXPO_PUBLIC_*` variables.

3) Run the app

```bash
npx expo start
```

Open on iOS simulator, Android emulator, or Expo Go.

## Features

- Home: search events by keyword and city; open event details
- Event Details: view info, venue, and favourite an event
- Favourites: stored locally on device using AsyncStorage + Legend-State
- Language toggle: English/Arabic; RTL layout applied
- Navigation: Splash → Home → Event Details → Profile
- Profile: view mock profile, toggle language, list favourite IDs
- Bonus: Login & Sign Up screens with mock auth

## Tech

- Expo + Expo Router
- React Native Paper (UI)
- Axios (API client)
- TanStack Query (caching + persistence)
- Legend-State (local-first store) + AsyncStorage

## Structure

- `app/`: routes and screens (`splash`, `(tabs)`, `event/[id]`, `profile`, `auth/*`)
- `common/`: shared business logic and hooks
  - `api/`: `ticketmaster.ts` (Axios client + types)
  - `hooks/`: `useEvents.ts` (React Query hooks)
  - `stores/`: `userStore.ts` (language, favourites, profile persistence)
  - `providers/`: `Providers.tsx` (React Query, persistence, Paper)

## Assumptions

- Ticketmaster Discovery API is used; only endpoints required for search/detail are implemented
- Arabic wording is not translated; toggling Arabic enables RTL layout
- Mock auth stores a non-secure session locally for demo purposes

## Commands

```bash
npm install          # install deps
npx expo start       # run
npm run lint         # lint
```

## Live link

- If hosted with EAS or Expo, add the link here. For now, run locally with the commands above.
