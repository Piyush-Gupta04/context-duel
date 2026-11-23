# Context Duel 🎯

> **A real-time, turn-based multiplayer word semantic game created and developed by [Piyush Gupta](https://github.com/Piyush-Gupta04).**

🎮 **Live Game Link (Play Anytime on Mobile or PC)**:  
👉 **[https://context-duel.onrender.com](https://context-duel.onrender.com)**

---

## 🌐 24/7 Cloud Deployment

The game is **live and hosted around the clock** in the cloud on Render. 

- **Play Anytime**: Accessible 24/7 from any smartphone, tablet, or computer.
- **Zero Install**: Runs straight in your mobile browser (Safari, Chrome, etc.) with no apps to download or accounts to create.
- **Always Online**: Hosted independently on cloud infrastructure — runs continuously even when the developer's computer is completely shut down.

---

## 📖 What is Context Duel?

Context Duel is a competitive, contextual word-association game. 

Instead of guessing spelling or letter positions, you compete to discover a hidden secret word based purely on **meaning and semantic similarity**:

- The engine evaluates every guess against a 30,000-word dictionary using vector embeddings.
- Every guess receives an instant proximity rank from **1 to 30,000**:
  - **Rank 1**: The hidden secret word itself (Winner!).
  - **Rank 2 – 300**: Extremely hot! You are right around the concept.
  - **Rank 301 – 1,500**: Warm, closely related category or theme.
  - **Rank 1,501+**: Cold, distant semantic meaning.

---

## 📱 How to Play (Mobile & Desktop)

### 1. Two-Player Live Duel (1v1)
1. Open **[https://context-duel.onrender.com](https://context-duel.onrender.com)** on your phone or PC.
2. Enter your player name, select a difficulty (**Easy**, **Medium**, or **Hard**), and tap **Create a game for two**.
3. Copy the **4-letter game room code** and send it to your friend (via WhatsApp, iMessage, Discord, etc.).
4. Your friend opens the link on their phone, types their name, enters the 4-letter code under **Join**, and jumps in.
5. Take alternating turns submitting guesses. Both players see every guess and its rank update in real-time.
6. The first player to submit the secret word (**Rank 1**) wins the duel!

### 2. Solo Practice Mode
- Want to train your vocabulary alone? Tap **Solo** on the home screen to find the secret word in as few turns as possible.

### 3. Smart Hints
- If you and your opponent are stuck, you can use the **Hint** button on your turn.
- The hint system gives a simpler, common word that moves you closer to the target without revealing ranks below 2.

---

## 🛠️ Technical Highlights

- **Zero NPM Dependencies**: Built 100% on native Node.js core modules (`http`, `fs`, `path`). No third-party package dependencies, zero supply-chain risk, and zero bloat.
- **Fast In-Memory Vector Search**: 100-dimensional quantized word vectors (~3 MB) deliver sub-millisecond ranking calculations across 30,000 words.
- **Real-Time Memory State**: Active rooms and turns are tracked efficiently in lightweight server memory with automatic garbage collection after periods of inactivity.
- **Hardened Security**: Includes defense-in-depth HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`), per-IP rate limiting, and strict path boundary checks.
- **Responsive Mobile UI**: Pure vanilla CSS with dynamic dark/light theme support, custom typography, and touch-optimized controls.

---

## 💻 Local Development (Optional)

If you wish to clone and run the project locally on your machine:

### Prerequisites
- Node.js 18 or newer

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/Piyush-Gupta04/context-duel.git
cd context-duel

# 2. Start the server (no npm install needed!)
node server.js

# 3. Open in your browser
http://localhost:3000
```

---

## 👨‍💻 Developer & Credits

**Piyush Gupta**  
- GitHub: [@Piyush-Gupta04](https://github.com/Piyush-Gupta04)  
- Live Game: [https://context-duel.onrender.com](https://context-duel.onrender.com)  
- Repository: [Piyush-Gupta04/context-duel](https://github.com/Piyush-Gupta04/context-duel)
