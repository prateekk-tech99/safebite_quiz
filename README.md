<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sOaKu3gIx7JP51PGh7gfgmr3_17DfZDx

## Run Locally

**Prerequisites:**  Node.js

### Security-First Architecture
This application uses a secure backend service to handle Gemini API calls, ensuring API keys are never exposed to client-side code.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start both the backend and frontend:
   
   **Option 1: Using Replit Workflows (Recommended)**
   - Both Backend and Frontend workflows are configured and will run automatically
   - Backend runs on port 3001
   - Frontend runs on port 5000 with proxy configuration
   
   **Option 2: Manual Start**
   ```bash
   # Terminal 1 - Start backend server
   npm run server
   
   # Terminal 2 - Start frontend
   npm run dev
   ```

### Architecture Overview
- **Backend (Express)**: Handles Gemini API calls securely on port 3001
- **Frontend (React + Vite)**: Serves the UI on port 5000 with API proxy
- **Security**: API keys are only accessible server-side, never exposed to clients
