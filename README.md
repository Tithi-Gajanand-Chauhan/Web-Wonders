# Web Wonders 2026 - CineCircle 🎬

## 📖 About the Project

Developed as part of Web Wonders 2026 under the Media & Entertainment theme, CineCircle is an AI-powered entertainment discovery and collaborative movie selection platform.

🔗 **Live Deployment:** [https://cinecircle-zahg.onrender.com](https://cinecircle-zahg.onrender.com)


Instead of showing generic trending content, CineCircle focuses on personalized and group-based discovery to solve the problem of decision fatigue:
* **For the individual:** CineCircle offers a cinematic space where users can explore curated categories, search and sort watchlist collections, track screens watch time, and get detailed analytics on their favorite film genres. In addition, an individual can create a watch party solo to generate AI-powered recommendations tailored strictly to their own mood, language, and genre preferences.
* **For groups of friends and family:** CineCircle allows users to create virtual Watch Parties. Group members enter their genre, language, and current mood preferences. The platform uses a compatibility algorithm based on preference overlap to generate group recommendations. Members can then vote in real-time to decide what to watch.

---

## 🚀 Key Features

* 🎥 **Curated Cinematic Catalog:** Discover movies organized by decades, underrepresented directors spotlight, global categories (Hollywood, Indian, Korean, Japanese), and regional Indian cinema (Marathi, Gujarati).
* 👥 **Group & Individual Watch Lobbies:** Create watchrooms solo or join rooms via unique group codes to sync preferences with friends and family.
* ⚖️ **Compatibility Index Algorithm:** Calculates group compatibility scores (using Jaccard similarity metrics) based on preference agreement before recommending movies.
* 🗳️ **Group Voting System:** Live voting on generated recommendations to choose the winning movie.
* 😊 **Mood-Based Discovery:** Choose current moods (e.g. Happy, Relaxed, Excited, Emotional, Sad) to dynamically shape recommendations.
* 🛡️ **Safe Search Toggle:** Navbar switch to instantly filter out adult/NC-17 titles.
* 📊 **Personal Analytics Dashboard:** Track watched films count, liked movies, estimated cumulative screen-time, and get a Top 5 favorite genres distribution progress bar.
* ⭐ **Library & Watchlist Management:** Tabbed library drawer for watchlists, watched, and liked checklists, with title-based searching and sorting.

---

## 📁 Repository & Deployment Structure

This repository is structured as a **Monorepo** containing two distinct modules:
* `CineCircle-frontend`: The client interface built with React (Vite).
* `CineCircle-backend`: The API server built with Node.js and Express.

On the production server (Render), these modules are **deployed separately**:
1. The **Frontend** is deployed as a **Static Site** pointing to the `CineCircle-frontend/` subdirectory.
2. The **Backend** is deployed as a **Web Service** pointing to the `CineCircle-backend/` subdirectory.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite), React Router DOM (v7), Vanilla CSS (Glassmorphism & animations)
* **Backend:** Node.js + Express.js, JSON Web Tokens (JWT), BcryptJS
* **Database:** MongoDB (Mongoose ODM) + Local JSON fallbacks for offline development
* **APIs:** TMDB API, Gemini API

---

## 👥 Team Members & Modules

* **Gayathri** - Authentication Module
* **Mahathi** - Content Discovery Module
* **Hiya Patel** - Reviews & Watchlist Module
* **Tithi Gajanand Chauhan** - Group Recommendation & AI Module

---

## 💻 Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tithi-Gajanand-Chauhan/Web-Wonders.git
   cd Web-Wonders
   git checkout side
   ```

2. **Configure and run the Backend:**
   ```bash
   cd CineCircle-backend
   npm install
   ```
   Create a `.env` file inside `CineCircle-backend`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/cinecircle
   JWT_SECRET=your_jwt_secret_key
   TMDB_TOKEN=your_tmdb_bearer_token
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Configure and run the Frontend:**
   ```bash
   cd ../CineCircle-frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173`.

---

## Competition
**Web Wonders 2026**  
Theme: Media & Entertainment
