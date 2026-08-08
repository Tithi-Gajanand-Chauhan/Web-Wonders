# Web Wonders 2026 - CineCircle 🎬

## 📖 About the Project

CineCircle is a premium AI-powered entertainment discovery platform that blends intelligent discovery with secure, real-time social interaction to make deciding what to watch fun, effortless, and safe. Developed under the **Media & Entertainment** theme for **Web Wonders 2026**, the platform curates personalized recommendations using advanced Gemini AI models.

Beyond standard individual suggestions, it introduces real-time Watch Parties—dynamic lobby rooms where friends and family can vote on movie selections, like entries with live-attributed likes and automatically find the ultimate compromise choice. Backed by robust security rules, including strict single-device login enforcement, owner-restricted watchlist deletes, and room-leaving exit permanence.

---

## Key Features

* Personal User Profiles: Integrated portals for custom lists, user ratings, reviews, and personal watchlists.
* AI-Driven Content Curation: Personalized movie, TV, and mood-based suggestions.
* Real-Time Watch Parties: Dynamic group lobby rooms that analyze members' preferences to find the perfect movie compromise.
* Attributed Social Watchlists: Live synced group watchlists featuring contributor tags and interactive heart reactions.
* Secure Device Enforcement: Smart session restrictions for device login.

---

## Technology Stack

### Frontend

* React.js (Vite)
* React Router DOM (v7)
* Axios (HTTP Client)
* Custom Vanilla CSS

### Backend

* Node.js & Express.js
* JSON Web Tokens (JWT) & BcryptJS (Security)

### Database

* MongoDB (Mongoose ODM)
* Local JSON Database (Fallback offline storage)

### APIs & AI

* TMDB API (Movie Discovery)
* Gemini AI API (Google Generative AI SDK)

### Version Control

* Git & GitHub

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
