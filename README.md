# 🎮 Triviatron

**Triviatron** is a fast-paced, streak-based trivia game where players race against the clock to build the longest streak of correct answers possible.

🔗 **Live Game:** (https://salviyabalami.github.io/triviatron)

---

## 🕹 Features

- Streak-based scoring system to encourage consistent correct answers
- Real-time countdown timer (60 seconds per round)
- Interactive UI with immediate feedback, sound effects, and animations
- Trivia questions pulled dynamically from a live backend
- Friendly end screen and ability to replay immediately

---

## ⚠️ Notes

- **Initial load may be slow** due to backend cold start on Render’s free tier.
- If the game appears unresponsive at first, **please hard refresh and clear cache** (Cmd+Shift+R / Ctrl+Shift+R).
- Trivia content and answers are served via a live Express backend on [Render](https://render.com).

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js + Express (Render-hosted)
- **Media**: Sounds and images hosted locally
- **Hosting**: GitHub Pages (frontend), Render (API backend)

---

## 💡 Game Logic Highlights

- Tracks `streak` and `highScore` in-session
- Uses `fetch()` to communicate with endpoints like:
  - `/triviatron/welcome-text`
  - `/triviatron/question`
  - `/triviatron/answer`
- Game audio includes feedback for correct/incorrect answers and background music

---

## 🧠 Author

**Salviya Balami**  
CS132 — Spring 2025  
California Institute of Technology  
