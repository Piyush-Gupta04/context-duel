# Context Duel

Hey! I built **Context Duel** — a multiplayer word game where you guess a secret word based on its *meaning*, not its letters.

Instead of telling you which letters are right (like Wordle), every guess gets a rank based on how close its meaning is to the secret word. Rank 1 is the secret word itself. If you guess a word and get rank 25, you're super warm. If you get rank 18,000, you're way off.

You can play it on your phone or laptop right now:  
👉 **[https://context-duel.onrender.com](https://context-duel.onrender.com)**

*(It's deployed 24/7 on Render, so anyone can open the link and play anytime, even when my laptop is shut down!)*

---

## Why I made this

I love games like Contexto, but I wanted a clean 1v1 version that I could play with friends in real time without downloading an app, making an account, or dealing with ads. 

Just send a 4-letter room code to a friend on WhatsApp or Discord, jump in, and start taking turns.

---

## How to play

### 1v1 Mode (with a friend)
1. Head over to [context-duel.onrender.com](https://context-duel.onrender.com).
2. Enter your name, choose a difficulty (Easy, Medium, or Hard), and hit **Create a game for two**.
3. You'll get a 4-letter code (like `ABCD`). Send it to your friend.
4. Your friend goes to the same link, types their name, puts the code under **Join**, and clicks Join.
5. Take turns typing words. Every time you or your friend guesses, you both see the word and its rank in real-time.
6. Whoever hits **Rank 1** (the exact word) wins!

### Solo Mode
If nobody is around to play, just choose **Solo** on the home screen and see how few guesses you need to reach rank 1.

### Quick Example
Suppose the hidden word is **`ocean`**:
- Guess `pizza` -> Rank #16,420 (completely cold)
- Guess `ship` -> Rank #620 (getting somewhere)
- Guess `water` -> Rank #38 (very hot!)
- Guess `sea` -> Rank #3 (almost there!)
- Guess `ocean` -> **Rank #1 — You win!**

### Stuck? Use a hint
On your turn, you can hit **Hint**. It won't give away the win (it never gives anything below rank 2), but it gives you a simpler related word to point you in the right direction.

---

## How it works under the hood

A few things about how I built this:

- **Zero npm packages**: The entire backend (`server.js`) uses only native Node.js (`http`, `fs`, `path`). No `node_modules` folder, no third-party dependencies.
- **Word vectors**: It uses GloVe word embeddings compressed into a 3 MB binary file (`data/vectors.bin`). When a round starts, the server ranks all 30,000 words against the secret word in memory using cosine similarity. It takes just a few milliseconds.
- **No database needed**: Games run entirely in memory on the server and clean themselves up after 12 hours of inactivity.
- **Mobile-friendly**: The UI is written in plain HTML/CSS/JS and sized to feel like a native app on mobile screens, complete with light and dark mode.

---

## Running it locally

If you want to run it on your own machine:

1. Make sure you have **Node 18+** installed.
2. Clone this repo:
   ```bash
   git clone https://github.com/Piyush-Gupta04/context-duel.git
   cd context-duel
   ```
3. Run the server (no `npm install` needed!):
   ```bash
   node server.js
   ```
4. Open `http://localhost:3000` in your browser.

---

## Built by

**Piyush Gupta**  
GitHub: [@Piyush-Gupta04](https://github.com/Piyush-Gupta04)  
Feel free to open an issue or share feedback if you play it and find any fun word combos or bugs!
