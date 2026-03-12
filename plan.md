# Project Architecture Plan

This document outlines the structure and architecture of the First Aid Emergency application, encompassing both the frontend and backend components.

## Overall Structure

The project is structured as a monorepo containing two main directories:
- `frontend/`: The client-side application built with React and Vite.
- `backend/`: The server-side application providing the API and handling business logic.

---

## Frontend Architecture (`/frontend`)

The frontend is a modern web application built using **React** and **Vite** as the build tool. It uses Tailwind CSS for styling and includes various components for different features.

### Key Directories and Files

- **`src/`**: Contains the source code for the React application.
  - **`components/`**: Reusable UI components.
    - `Login.jsx`, `Register.jsx`: Authentication components.
    - `ui/`: UI component library (likely shadcn/ui or similar given `components.json`).
  - **`Pages/`**: Top-level page components representing different views in the application.
    - `Home.jsx`: The main landing page.
    - `Emergency.jsx`, `first_Aid.jsx`: Core emergency guidance pages.
    - `HealthWallet.jsx`, `HealthWallet.jsx`: Health information management.
    - `Hospital.jsx`: Hospital locator/information.
    - `ChatBot.jsx`: Integrated AI chatbot interface.
    - `LiveMap.jsx`: Mapping feature.
    - `Profile.jsx`, `ProfileView.jsx`: User profile management.
    - `VideoCall.jsx`: Video consultation feature.
    - `Watch.jsx`, `HeartRate.jsx`: Health metrics monitoring.
    - `CardDetails.jsx`: ID or health card details view.
  - **`context/`**: React Context providers for centralized state management.
  - **`lib/`**: Utility functions and libraries.
  - **`assets/`**: Static assets like images.
  - `main.jsx`: The application entry point.
  - `App.jsx`, `App.css`: The root component and its styles.
  - `index.css`: Global styles mostly utilizing Tailwind directives.

### Configuration Files

- `package.json`, `package-lock.json`: Node.js dependency management.
- `vite.config.js`: Configuration for the Vite bundler.
- `tailwind.config.js`, `postcss.config.js`: Tailwind CSS configuration.
- `eslint.config.js`: Linter configuration.
- `components.json`: Configuration for UI component generation/management.

---

## Backend Architecture (`/backend`)

The backend is a Node.js server, likely using **Express.js**, that provides RESTful APIs for the frontend. It follows a modular structure separating controllers, models, and routes.

### Key Directories

- **`controller/`**: Contains the business logic for handling incoming requests.
  - `User.controller.js`: Handles user authentication and management.
  - `HealthWalletController.js`: Manages user health records and data.
  - `EmergencyController.js`: Logic for emergency-related features.
  - `Profile.js`: Profile management logic.
  - `Image_Generate_video.js`: Logic for generating video from images.
  - `ChatbotSchema.js`: Logic related to the chatbot functionality.
- **`model/`**: Defines the data schemas (likely Mongoose schemas for MongoDB).
  - `User.js`, `Profile.model.js`: User and profile schemas.
  - `HealthWallet.model.js`: Health wallet data schema.
- **`routes/`**: Defines the API endpoints and maps them to controllers.
  - `UserRoute.js`, `ProfileRoute.js`, `HealthWalletRoute.js`, `LocationRoute.js`, `ImageRoute.js`: Routing configurations for respective domains.
- **`middleware/`**: Express middleware functions (e.g., for authentication, logging, error handling).
- **`utils/`**: Helper functions and utilities.
- **`generated_videos/`**: Directory for storing generated video files.

### Key Files

- `index.js`: The main entry point for the backend server, setting up the Express app and connecting to the database.
- `package.json`, `package-lock.json`: Node.js dependency management.
