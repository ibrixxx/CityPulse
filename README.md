# City Pulse – Local Events Explorer

City Pulse is an Expo app that lets you discover local events using the Ticketmaster Discovery API. It features event search by keyword and city, detailed event pages, favourites, language toggle (English/Arabic with RTL), a simple profile, and optional mock authentication.

https://www.dropbox.com/scl/fi/3d3rcpnm1v08wty7haqry/ScreenRecording_08-13-2025-3.MP4?rlkey=01lehqclqgjdqv3qbpef8l2m5&st=iv2xoyyk&dl=0

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

3) Run a development build (required)

This app uses native modules (Expo Maps, Local Authentication), so you must run a dev build instead of Expo Go.

```bash
npx expo install expo-dev-client
npm i -g eas-cli && eas login
# iOS
eas build --platform ios --profile development
# Android
eas build --platform android --profile development

# After installing the build on device/simulator, start the dev server
npx expo start
```

Open the development build and connect it to the running Metro server.

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
npx expo start       # start Metro (use with the development build)
npm run lint         # lint
```
