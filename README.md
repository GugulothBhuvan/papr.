# Papr Editor 📝

Papr is an AI-powered LaTeX editor designed to bring intelligent assistance directly into your writing workflow. It provides real-time AI capabilities such as context-aware drafting, smart LaTeX error fixing, and inline content editing.

## 🏗 Architecture

Papr is structured as a modern monorepo containing two main parts:

- **Frontend (`/frontend`)**: A React/Next.js application providing the web-based code editor and PDF viewer.
- **Backend (`/backend`)**: A Python FastAPI server orchestrating the Tectonic LaTeX compiler, file storage, and the AI agents.
- **AI Engine**: A highly modular multi-agent system supporting Groq (Llama 3) and Google Gemini for dynamic LaTeX generation, strict syntax validation, and RAG (Retrieval-Augmented Generation) based on your bibliography and packages.

---

## 🚀 Local Development Setup

To run Papr locally, you will need to start both the backend server and the frontend development server.

### 1. Backend Setup

The backend handles the API, AI generation, and LaTeX compilation.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up your Python virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set up your API Keys:
   Copy `.env.template` to `.env` and fill in your keys:
   ```bash
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   ```
4. Start the backend server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

### 2. Frontend Setup

The frontend provides the user interface.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open your browser to `http://localhost:3000`.

---

## 🌍 Deployment

Papr is optimized for deployment on serverless and PaaS platforms.

### Frontend Hosting (Vercel)
1. Import this repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Vercel will automatically detect Next.js and build the application.

### Backend Hosting (Render or Railway)
1. Import this repository into Render as a new "Web Service".
2. Set the **Root Directory** to `backend`.
3. Set the start command to:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 10000
   ```
4. Add your `GEMINI_API_KEY` and `GROQ_API_KEY` to the environment variables dashboard.
