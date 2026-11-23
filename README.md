# Context Duel

An online, turn-based multiplayer word semantic battle developed by **Piyush Gupta**.

- **Live Web Application**: [https://context-duel.onrender.com](https://context-duel.onrender.com)
- **Developer**: [Piyush Gupta (Piyush-Gupta04)](https://github.com/Piyush-Gupta04)

---

## What is Context Duel?

Context Duel is a vocabulary and meaning-association guessing game where players compete to find a hidden secret word.

Unlike letter-based puzzle games, Context Duel measures **contextual meaning**:
- The server evaluates guesses against a 30,000-word dataset using vector embeddings.
- Every word receives a numeric proximity score from 1 to 30,000.
- **Rank 1** is the secret target word itself.
- Lower ranks mean your guess is closer in concept to the hidden word.

---

## How to Play

### 1. Multiplayer Mode (Duel)
1. Open [https://context-duel.onrender.com](https://context-duel.onrender.com).
2. Type your name, pick a difficulty (Easy, Medium, or Hard), and select **Create a game for two**.
3. Send the generated 4-letter room code to your friend.
4. Your friend visits the link, enters their name and the 4-letter code under **Join**, and enters the room.
5. Take turns submitting words. Both players see all guesses and ranks in real-time.
6. The first player to submit the secret word (Rank 1) wins the match!

### 2. Solo Practice Mode
- Choose **Solo** on the home screen to test and sharpen your word association skills at your own pace.

### 3. Understanding the Ranks
- **Rank 1**: The exact target word (Victory!).
- **Ranks 2 - 300**: Extremely close in concept or theme (Green indicator).
- **Ranks 301 - 1,500**: Related context or category (Yellow indicator).
- **Ranks 1,501+**: Distant concept (Gray indicator).

### 4. Hints
- During your turn, you can take a hint if you need guidance. The system will reveal a simpler related word to help narrow your search without spoiling rank 1.

---

## Technical Architecture

- **Zero NPM Runtime Dependencies**: The entire backend server runs solely on native Node.js core modules (`http`, `fs`, `path`), eliminating package vulnerabilities and heavy dependencies.
- **Vector Space Matching**: Evaluates 100-dimensional quantized word vectors in memory, delivering instant ranking calculations.
- **In-Memory Game Engine**: Game sessions and turns are synchronized in lightweight server memory with automatic cleanup of inactive rooms.
- **Built-in Security**: Includes defense-in-depth headers, per-IP request rate limiting, and strict path boundary checks.
- **Responsive Web Client**: Accessible across smartphones, tablets, and desktop computers with native dark/light theme support.

---

## Local Setup

### Requirements
- Node.js version 18 or higher

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Piyush-Gupta04/context-duel.git
   cd context-duel
   ```
2. Start the application:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3000` in your web browser.

---

## Author

- **Piyush Gupta**  
  GitHub: [@Piyush-Gupta04](https://github.com/Piyush-Gupta04)
