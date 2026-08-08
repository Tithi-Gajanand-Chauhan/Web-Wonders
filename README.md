# Web Wonders 2026 - CineCircle 🎬

## 📖 About the Project
Developed as part of **Web Wonders 2026** under the **Media & Entertainment** theme, **CineCircle** is an AI-powered entertainment discovery and collaborative movie selection platform. 

Instead of showing generic trending content, CineCircle focuses on personalized and group-based discovery to solve the problem of decision fatigue:
* **For the individual**: CineCircle offers a cinematic space where users can explore curated categories, search and sort watchlist collections, track screens watch time, and get detailed analytics on their favorite film genres. In addition, an individual can create a watch party solo to generate AI-powered recommendations tailored strictly to their own mood, language, and genre preferences.
* **For groups of friends and family**: CineCircle allows users to create virtual **Watch Parties**. Group members enter their genre, language, and current mood preferences. The platform uses a compatibility algorithm based on preference overlap to generate group recommendations. Members can then vote in real-time to decide what to watch.

---

## 🚀 Key Features

* 🎥 **Curated Cinematic Catalog**: Discover movies organized by decades, underrepresented directors spotlight, global categories (Hollywood, Indian, Korean, Japanese), and regional Indian cinema (Marathi, Gujarati).
* 👥 **Group & Individual Watch Lobbies**: Create watchrooms solo or join rooms via unique group codes to sync preferences with friends and family.
* ⚖️ **Compatibility Index Algorithm**: Calculates group compatibility scores (using Jaccard similarity metrics) based on preference agreement before recommending movies.
* 🗳️ **Group Voting System**: Live voting on generated recommendations to choose the winning movie.
* 😊 **Mood-Based Discovery**: Choose current moods (e.g. **Happy, Relaxed, Excited, Emotional, Sad**) to dynamically shape recommendations.
* 🛡️ **Safe Search Toggle**: Navbar switch to instantly filter out adult/NC-17 titles.
* 📊 **Personal Analytics Dashboard**: Track watched films count, liked movies, estimated cumulative screen-time, and get a Top 5 favorite genres distribution progress bar.
* ⭐ **Library & Watchlist Management**: Tabbed library drawer for watchlists, watched, and liked checklists, with title-based searching and sorting.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), React Router DOM, Vanilla CSS (Glassmorphism & animations)
* **Backend**: Node.js + Express.js
* **Database**: MongoDB (Mongoose) + Local JSON fallbacks for offline development
* **APIs**: TMDB API, Gemini API

---

## 👥 Team Members & Modules
* **Gayathri** - Authentication Module
* **Mahathi** - Content Discovery Module
* **Hiya Patel** - Reviews & Watchlist Module
* **Tithi Gajanand Chauhan** - Group Recommendation & AI Module
