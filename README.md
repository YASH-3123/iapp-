# 📸 GalleryApp (iapp)

A Pinterest-style photo gallery mobile app built with **React Native + Expo Router**. Browse photos from the [Picsum Photos](https://picsum.photos/) API in a masonry grid, search/filter by author, save favorites, download images to your device gallery, switch between light/dark themes, and manage a simple local user account.

---

## 1. Project Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node)
- [Expo Go](https://expo.dev/go) app on your phone **or** an Android/iOS emulator
- (Optional, for building an APK) An [Expo (EAS)](https://expo.dev) account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YASH-3123/iapp-.git
cd iapp-

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

Once the dev server starts, you can:

- Scan the QR code with the **Expo Go** app (Android/iOS) to run it on a physical device
- Press `a` to launch on an Android emulator
- Press `i` to launch on an iOS simulator (macOS only)
- Press `w` to run in a web browser

### Building an APK (Android)

This project uses **EAS Build** for generating installable binaries:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

The `preview` profile (configured in `eas.json`) produces an internally-distributable `.apk` you can install directly on a device, rather than the Play-Store-only `.aab` format used by the `production` profile.

### Environment Variables

The project includes a `.env` file with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. **This key is not currently used anywhere in the app** — it's a leftover from early scaffolding when Clerk-based authentication was considered. The app's actual authentication system is fully local (see [Assumptions](#2-assumptions-made-during-development) below), so **no environment variables are required to run the project**. It's safe to delete `.env` or leave it as-is.

---

## 2. Assumptions Made During Development

- **No backend / no real authentication provider.** Sign up and sign in are simulated entirely on-device using `AsyncStorage`. Registering writes a new user record to local storage; logging in checks the entered email/password against that local list. There is **no password hashing/encryption** — this is acceptable for a demo/assignment app but would need to be replaced with a real backend (and hashed passwords) for production use.
- **Picsum Photos as the image source.** Since the assignment didn't require a specific image API, [picsum.photos](https://picsum.photos/) was used to fetch placeholder photos (`/v2/list`) and to render images by ID, since it requires no API key and provides ready-made author/dimension metadata.
- **Favorites and theme preference persist locally**, not per-account. Favorites, the cached photo list, and the dark/light theme choice are all stored in `AsyncStorage` independent of which user is logged in — i.e., favorites aren't scoped per user account.
- **"Download to Gallery" requires media-library permission.** It's assumed the user will grant gallery/storage access when prompted; if denied, the app shows an alert and skips the download instead of crashing.
- **Search and filtering operate on already-fetched data.** The app fetches up to 100 photos once (`limit=100`) and does client-side search/filter/pagination ("Load more") over that in-memory list, rather than hitting the API again per keystroke or filter change.
- **Single device, single session.** Only one account can be "signed in" at a time; there's no multi-session or token-refresh handling since there's no real auth server.

---

## 3. Libraries Used

| Category            | Library                                                                                                                                                            | Purpose                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Framework           | `expo` (~54), `react`, `react-native`                                                                                                                              | Core app framework                                                |
| Routing             | `expo-router`                                                                                                                                                      | File-based navigation (stacks, tabs, auth-guarded routes)         |
| Navigation          | `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/elements`                                                                          | Underlying navigation primitives used by Expo Router              |
| Local storage       | `@react-native-async-storage/async-storage`                                                                                                                        | Persisting users, session, favorites, photo cache, theme          |
| Media               | `expo-media-library`                                                                                                                                               | Saving downloaded photos to the device gallery                    |
| File handling       | `expo-file-system`                                                                                                                                                 | Downloading remote images to local storage before saving          |
| Sharing             | `expo-sharing`                                                                                                                                                     | (Available for) sharing photos outside the app                    |
| Icons               | `@expo/vector-icons` (Ionicons)                                                                                                                                    | All in-app iconography                                            |
| Images/UI           | `expo-image`, `expo-linear-gradient`                                                                                                                               | Image rendering and gradient effects                              |
| Styling             | `nativewind`, `tailwindcss`                                                                                                                                        | Utility-first styling support (alongside `StyleSheet.create`)     |
| Animations/gestures | `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`                                                                                 | Smooth animations (press scale, heart pulse) and gesture handling |
| Misc Expo modules   | `expo-constants`, `expo-haptics`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`, `expo-web-browser`, `expo-dev-client` | Standard Expo SDK utilities and native module support             |
| Dev tooling         | `typescript`, `eslint`, `eslint-config-expo`, `prettier-plugin-tailwindcss`                                                                                        | Type safety, linting, formatting                                  |

---

## 4. Folder Structure Explanation

```
iapp/
├── app/                          # All screens & routing (Expo Router — file-based)
│   ├── _layout.tsx               # Root layout: wraps app in ThemeProvider + AuthProvider
│   ├── index.tsx                 # Entry redirect: → tabs if signed in, else → sign-in
│   │
│   ├── (auth)/                   # Unauthenticated route group
│   │   ├── _layout.tsx           # Auth stack layout; redirects away if already signed in
│   │   ├── sign-in.tsx           # Sign-in screen (email + password)
│   │   ├── sign-up.tsx           # Registration screen (name, email, mobile, gender, address, city, password)
│   │   └── Authcontext.tsx       # ⚠️ Unused duplicate of context/AuthContext.tsx (leftover from refactor — safe to delete)
│   │
│   └── (root)/(tabs)/            # Authenticated route group (bottom tab navigator)
│       ├── _layout.tsx           # Tab bar config (Home, Saved, Profile) — redirects to sign-in if logged out
│       ├── index.tsx             # Home: searchable/filterable masonry photo grid, pull-to-refresh, pagination
│       ├── favorites.tsx         # Saved tab: shows favorited photos, with local search + remove
│       ├── profile.tsx           # Profile tab: view/edit account details, avatar picker, theme toggle, logout
│       └── image-detail.tsx      # Full photo view: fullscreen modal, favorite toggle, download to gallery
│
├── components/                   # Reusable UI building blocks
│   ├── ThemeContext.tsx          # Light/dark color palettes + theme provider (persisted in AsyncStorage)
│   ├── PinterestCard.tsx         # Masonry grid card used on the Home screen (in active use)
│   ├── PhotoCard.tsx             # ⚠️ Earlier/unused card variant, kept for reference (not imported anywhere)
│   ├── SearchBar.tsx             # Reusable search input with clear button
│   └── FilterChips.tsx           # Reusable horizontal filter chip selector
│
├── context/
│   └── AuthContext.tsx           # ✅ The actual auth provider used app-wide: register/login/logout via AsyncStorage
│
├── hooks/                        # Reusable logic hooks
│   ├── useApi.ts                 # Generic fetch wrapper (loading/error/data state)
│   ├── useStorage.ts             # Generic AsyncStorage read/write hook (used for favorites)
│   ├── useDebounceSearch.ts      # Debounces a search string (300ms default)
│   └── usePagination.ts          # ⚠️ Generic pagination helper, currently unused (Home screen implements pagination inline)
│
├── assets/images/                # App icons, splash screen, and default Expo placeholder images
├── app.json                      # Expo app config (name, bundle IDs, icons, plugins)
├── eas.json                      # EAS Build profiles (development / preview / production)
├── babel.config.js / metro.config.js / tailwind.config.js  # Build & styling tool configs
├── tsconfig.json                 # TypeScript configuration
└── package.json                 # Dependencies & npm scripts
```

### Notes on flagged (⚠️) files

A couple of files are leftovers from development iteration and aren't part of the active code path:

- `app/(auth)/Authcontext.tsx` — an earlier version of the auth context; the app actually imports auth from `context/AuthContext.tsx`.
- `components/PhotoCard.tsx` and `hooks/usePagination.ts` — earlier implementations that were superseded by `PinterestCard.tsx` and the inline pagination logic in `app/(root)/(tabs)/index.tsx`, respectively.

These are kept in the repo for reference but can be safely removed without affecting functionality.

---

## App Flow Summary

1. **Launch** → `app/index.tsx` checks if a session is stored → redirects to Sign In or the Home tab.
2. **Sign Up / Sign In** → credentials are validated client-side and stored/checked against `AsyncStorage`.
3. **Home tab** → fetches photos from Picsum, displays them in a two-column masonry layout with search, A–Z filter chips, "Load more" pagination, and pull-to-refresh.
4. **Tap a photo** → opens the detail screen with a fullscreen viewer and a "Download to Gallery" action (saves via `expo-media-library`).
5. **Heart icon** → toggles a photo as a favorite (persisted locally), visible in the **Saved** tab.
6. **Profile tab** → edit personal details, pick an avatar emoji, toggle dark/light theme, or log out.
