# First Aid Emergency App - Walkthrough & Technical Details

This document provides a comprehensive walkthrough of the First Aid Emergency application's features, and details the technical architecture regarding frontend views and backend API routing.

---

## 1. Features Overview

The application is designed to be a lifesaver in emergency situations, offering a suite of accessible tools and health record management features.

*   **Emergency Assistance & First Aid**: Instant guidance during emergencies (`/emergency`, `/first-aid`) with possible nearby hospital location services.
*   **Health Wallet**: A dedicated space (`/health-wallet`) to securely store, retrieve, and manage personal health records and medical data. Includes features like symptom tracking and prescription analysis.
*   **User Profiles**: Full user authentication and profile management, allowing users to store information for themselves or "someone else" (e.g., dependents). Profiles include sharable "Profile Views".
*   **Heart Rate & Wearable Tech Integration**: Built-in features to check heart rate (`/heart`) and connect to Bluetooth enabled smartwatches (`/watch`).
*   **AI Chatbot & Video Services**: An integrated `EmergencyChatbot` available persistently across most pages, and capabilities to generate informative video content from images.
*   **Hospital Locator**: Dedicated interactive map/hospital feature (`/hospitals`) to find the nearest care centers.

---

## 2. Frontend Routing & Views

The frontend is a React Application utilizing React Router for client-side navigation.

| Route Path | React Component | Description |
| :--- | :--- | :--- |
| `/` | `Home` | Landing page for the application. |
| `/register` | `Register` | User account creation page. |
| `/login` | `Login` | User authentication/login page. |
| `/first-aid` | `FirstAid` | Detailed first aid instructions and guides. |
| `/emergency` | `Emergency` | Core dashboard for acute emergencies. |
| `/profile` | `Profile` | User's personal settings and profile dashboard. |
| `/hospitals` | `Hospital` | Hospital finder and listing page. |
| `/health-wallet` | `HealthWallet` | Interface for managing health records and medical data. |
| `/heart` | `HeartRateChecker` | Application interface to monitor/record heart rate. |
| `/watch` | `WatchBluetoothConnect` | Interface to pair and connect Bluetooth wearables. |
| `/profile-view/:id` | `ProfileView` | Public or shared view of a specific profile by ID. |
| `/profile-view` | `ProfileView` | General profile viewing interface. |

***Note:** The `Navbar` and `EmergencyChatbot` components are persistently rendered on all pages *except* for the `/profile-view` route.*

---

## 3. Backend Services & Routing Endpoints

The backend is built with Express.js. It mounts several distinct modular routers onto versioned API paths.

### 3.1 Authentication & Users (`UserRoute.js`)
**Base Path:** `/api/v1`

| HTTP Method | Endpoint | Controller Logic | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | `register` | Creates a new user account. |
| `POST` | `/login` | `login` | Authenticates a user and issues a session/token. |
| `POST` | `/logout` | `logout` | Ends the user's session. |
| `GET` | `/current` | `getCurrentUser` | Returns the currently authenticated user (requires Auth). |

### 3.2 Media & Video Services (`ImageRoute.js`)
**Base Path:** `/api/v2`

| HTTP Method | Endpoint | Controller Logic | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/Image` | `generateVideoFromImage`| Uploads/processes an image to generate a video representation. |

### 3.3 User Profile Management (`ProfileRoute.js`)
**Base Path:** `/api/v3`

| HTTP Method | Endpoint | Controller Logic | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/profile` | `upsertProfile` | Creates or updates (upserts) a user profile. |
| `GET` | `/profileDetail/:id`| `profileDetailById` | Retrieves extensive profile details using a specific MongoDB ID.|
| `PUT` | `/profile/:id` | `updateProfileById` | Manually updates an existing profile via ID. |
| `GET` | `/profile/person/:type`| `profileByPersonName`| Fetches profiles based on relation type (e.g., "myself", "someone else").|

### 3.4 Location, Alerts & Chatbot (`LocationRoute.js`)
**Base Path:** `/api/v4`

| HTTP Method | Endpoint | Controller Logic | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/location` | `getNearestHospitals` | Queries backend for the closest hospitals. |
| `POST` | `/mail` | `alert` | Triggers an email alert system (via Nodemailer) for emergencies. |
| `POST` | `/message` | `getChatResponse`| Communicates with the AI chatbot engine to receive a response. |

### 3.5 Health Wallet Features (`HealthWalletRoute.js`)
**Base Path:** `/api/v5`

| HTTP Method | Endpoint | Controller Logic | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health-wallet` | `getHealthWallet` | Retrieves the authenticated user's health wallet contents. |
| `POST` | `/health-wallet` | `saveHealthWallet`| Saves or updates data within the user's health wallet. |
| `POST` | `/symptom-check` | `symptomCheck` | Analyzes provided symptoms and returns potential insights. |
| `GET` | `/doctor-search` | `searchDoctors` | Service to locate nearby or relevant medical professionals. |
| `POST` | `/analyze-prescription`| `analyzePrescription`| Processes and extracts structured data from prescriptions. |
