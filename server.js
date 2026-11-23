"use strict";
/*
 * Context Duel server. No npm packages needed, just Node 18 or newer.
 *   node server.js        then open http://localhost:3000
 *
 * Games live in memory. If the server restarts, running games are lost (fine for a casual game).
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DIM = 100;
const SIMPLE_MAX = 8000;      // words ranked in the 8000 most common count as "simple" for hints
const GAME_TTL = 12 * 3600e3; // forget games after 12 hours of silence
const MAX_GAMES = 5000;

/* ---------- load word data ---------- */
const words = fs.readFileSync(path.join(__dirname, "data", "words.txt"), "utf8").split("\n");
const N = words.length;
const raw = fs.readFileSync(path.join(__dirname, "data", "vectors.bin"));
if (raw.length !== N * DIM) throw new Error("vectors.bin does not match words.txt");
const vecs = new Int8Array(raw.buffer, raw.byteOffset, N * DIM);
const index = new Map(words.map((w, i) => [w, i]));
const secretLists = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "secrets.json"), "utf8"));
const simple = new Uint8Array(N);
for (let i = 0; i < Math.min(SIMPLE_MAX, N); i++) simple[i] = 1;
for (const l of Object.values(secretLists)) for (const w of l) simple[index.get(w)] = 1;

/* Rank every word by closeness to the secret. Rank 1 is the secret itself. */
function buildRanking(secretIdx) {
  const sims = new Float32Array(N);
  const base = secretIdx * DIM;
  for (let i = 0; i < N; i++) {
    let s = 0, o = i * DIM;
    for (let d = 0; d < DIM; d++) s += vecs[base + d] * vecs[o + d];
    sims[i] = s;
  }
  sims[secretIdx] = Infinity;
  const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => sims[b] - sims[a]);
  const rankOf = new Int32Array(N);
  order.forEach((idx, pos) => { rankOf[idx] = pos + 1; });
  return { order, rankOf };
}

/* ---------- games ---------- */
const games = new Map();
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ";
function newCode() {
  for (let t = 0; t < 200; t++) {
    let c = "";
    for (let i = 0; i < 4; i++) c += ALPHA[Math.floor(Math.random() * ALPHA.length)];
    if (!games.has(c)) return c;
  }
  throw new Error("no free codes");
}
const cleanName = s => String(s || "").replace(/\s+/g, " ").trim().slice(0, 16);
const okPid = p => typeof p === "string" && /^[A-Za-z0-9]{8,40}$/.test(p);

function makeGame({ hostId, hostName, guestId = null, guestName = "", level, solo }) {
  if (games.size >= MAX_GAMES) throw new Error("busy");
  const list = secretLists[level] || secretLists.medium;
  const secret = list[Math.floor(Math.random() * list.length)];
  const secretIdx = index.get(secret);
  const { order, rankOf } = buildRanking(secretIdx);
  const g = {
    code: newCode(), solo: !!solo, level: secretLists[level] ? level : "medium",
    hostId, hostName, guestId, guestName,
    secret, secretIdx, order, rankOf,
    guesses: [], gaveUp: false, next: null, v: 1, touched: Date.now()
  };
  games.set(g.code, g);
  return g;
}
const roleOf = (g, pid) => pid === g.hostId ? "host" : pid === g.guestId ? "guest" : "spectator";
const plays = g => g.guesses.filter(x => !x.hint).length;
const winner = g => g.guesses.find(x => x.rank === 1);
const isOver = g => !!winner(g) || g.gaveUp;
function turnRole(g) { return g.solo ? "host" : (plays(g) % 2 === 0 ? "host" : "guest"); }
function touch(g) { g.v++; g.touched = Date.now(); }

function view(g, pid) {
  const over = isOver(g);
  return {
    code: g.code, solo: g.solo, level: g.level, v: g.v,
    hostName: g.hostName, guestName: g.guestName, joined: !!g.guestId,
    you: roleOf(g, pid),
    turn: turnRole(g),
    over, gaveUp: g.gaveUp, secret: over ? g.secret : null,
    next: g.next,
    guesses: g.guesses.map(x => ({ n: x.n, word: x.word, rank: x.rank, hint: !!x.hint, by: x.by }))
  };
}

setInterval(() => {
  const cut = Date.now() - GAME_TTL;
  for (const [c, g] of games) if (g.touched < cut) games.delete(c);
}, 10 * 60e3).unref();

/* ---------- actions ---------- */
class Fail extends Error { constructor(status, msg) { super(msg); this.status = status; } }

const actions = {
  create(b) {
    if (!okPid(b.pid)) throw new Fail(400, "Bad player id.");
    const name = cleanName(b.name) || (b.solo ? "You" : "");
    if (!name) throw new Fail(400, "Enter a name first.");
    const g = makeGame({ hostId: b.pid, hostName: name, level: b.level, solo: !!b.solo });
    return view(g, b.pid);
  },
  join(b) {
    const g = games.get(String(b.code || "").toUpperCase());
    if (!g) throw new Fail(404, "No game with that code. Check it with your friend.");
    if (!okPid(b.pid)) throw new Fail(400, "Bad player id.");
    if (g.hostId === b.pid || g.guestId === b.pid) return view(g, b.pid);
    const name = cleanName(b.name);
    if (!name) throw new Fail(400, "Enter a name first.");
    if (g.solo) throw new Fail(400, "That code belongs to a solo game.");
    if (g.guestId) throw new Fail(400, "That game already has two players.");
    g.guestId = b.pid; g.guestName = name; touch(g);
    return view(g, b.pid);
  },
  state(b) {
    const g = games.get(String(b.code || "").toUpperCase());
    if (!g) throw new Fail(404, "This game no longer exists. Leave and start a new one.");
    if (Number(b.v) === g.v) return { same: true };
    return view(g, b.pid);
  },
  guess(b) {
    const g = need(b);
    const role = roleOf(g, b.pid);
    if (role === "spectator") throw new Fail(403, "You are not playing in this game.");
    if (isOver(g)) throw new Fail(400, "This round is over.");
    if (!g.solo && !g.guestId) throw new Fail(400, "Waiting for a second player.");
    if (role !== turnRole(g)) throw new Fail(400, "It is not your turn.");
    const w = String(b.word || "").trim().toLowerCase();
    if (!/^[a-z]{2,20}$/.test(w)) throw new Fail(400, "Use one word, letters only.");
    const idx = index.get(w);
    if (idx === undefined) throw new Fail(400, `“${w}” is not in the word list. Try a simpler word.`);
    const dupe = g.guesses.find(x => x.word === w);
    if (dupe) throw new Fail(400, `“${w}” was already guessed, rank ${dupe.rank.toLocaleString("en-US")}. Try another word.`);
    g.guesses.push({ n: g.guesses.length, word: w, rank: g.rankOf[idx], by: role });
    touch(g);
    return view(g, b.pid);
  },
  hint(b) {
    const g = need(b);
    const role = roleOf(g, b.pid);
    if (role === "spectator") throw new Fail(403, "You are not playing in this game.");
    if (isOver(g)) throw new Fail(400, "This round is over.");
    if (!g.solo && !g.guestId) throw new Fail(400, "Waiting for a second player.");
    if (role !== turnRole(g)) throw new Fail(400, "Hints can only be taken on your own turn.");
    const best = g.guesses.length ? Math.min(...g.guesses.map(x => x.rank)) : N;
    if (best <= 2) throw new Fail(400, "You are already at rank 2, the closest a hint goes.");
    const B = Math.min(best, 3000);
    const target = Math.max(2, Math.floor(B / 4));
    const used = new Set(g.guesses.map(x => x.word));
    const good = r => {
      const w = words[g.order[r - 1]];
      return simple[g.order[r - 1]] && !used.has(w) && !w.startsWith(g.secret) && !g.secret.startsWith(w) && w !== g.secret;
    };
    let pick = 0;
    for (let r = target; r < best && !pick; r++) if (good(r)) pick = r;
    for (let r = target - 1; r >= 2 && !pick; r--) if (good(r)) pick = r;
    if (!pick) throw new Fail(400, "No new hint is available right now.");
    g.guesses.push({ n: g.guesses.length, word: words[g.order[pick - 1]], rank: pick, hint: true, by: role });
    touch(g);
    return view(g, b.pid);
  },
  giveup(b) {
    const g = need(b);
    if (roleOf(g, b.pid) === "spectator") throw new Fail(403, "You are not playing in this game.");
    if (!isOver(g)) { g.gaveUp = true; touch(g); }
    return view(g, b.pid);
  },
  again(b) {
    const g = need(b);
    const role = roleOf(g, b.pid);
    if (role === "spectator") throw new Fail(403, "You are not playing in this game.");
    if (!g.solo && g.next && games.has(g.next)) return view(games.get(g.next), b.pid);
    const n = g.solo
      ? makeGame({ hostId: g.hostId, hostName: g.hostName, level: g.level, solo: true })
      : makeGame({
          hostId: b.pid, hostName: role === "host" ? g.hostName : g.guestName,
          guestId: role === "host" ? g.guestId : g.hostId,
          guestName: role === "host" ? g.guestName : g.hostName,
          level: g.level, solo: false
        });
    if (!g.solo) { g.next = n.code; touch(g); }
    return view(n, b.pid);
  }
};
function need(b) {
  const g = games.get(String(b.code || "").toUpperCase());
  if (!g) throw new Fail(404, "This game no longer exists.");
  if (!okPid(b.pid)) throw new Fail(400, "Bad player id.");
  return g;
}

/* ---------- http ---------- */
const hits = new Map();
setInterval(() => hits.clear(), 60e3).unref();
const RATE_LIMIT = Number(process.env.RATE_LIMIT) || 600;   // requests per minute per IP
function limited(ip) { const n = (hits.get(ip) || 0) + 1; hits.set(ip, n); return n > RATE_LIMIT; }

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json" };
const PUBLIC = path.join(__dirname, "public");

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  });
  res.end(body);
}

http.createServer((req, res) => {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (limited(ip)) return send(res, 429, { error: "Too many requests. Wait a moment." });
  const url = new URL(req.url, "http://x");

  if (url.pathname === "/healthz") return send(res, 200, { ok: true, games: games.size });

  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.slice(5);
    const fn = actions[name];
    if (!fn) return send(res, 404, { error: "Unknown request." });
    const run = body => {
      try { send(res, 200, fn(body)); }
      catch (e) {
        if (e instanceof Fail) send(res, e.status, { error: e.message });
        else { console.error(e); send(res, 500, { error: "Something went wrong on the server. Try again." }); }
      }
    };
    if (req.method === "GET" && name === "state") return run(Object.fromEntries(url.searchParams));
    if (req.method !== "POST") return send(res, 405, { error: "Use POST." });
    let data = "";
    let tooLarge = false;
    req.on("error", () => {});
    req.on("data", c => {
      data += c;
      if (data.length > 2048) {
        tooLarge = true;
        req.destroy();
      }
    });
    req.on("end", () => {
      if (tooLarge || req.destroyed) return;
      let b = {};
      try { b = JSON.parse(data || "{}"); } catch (e) {}
      run(b && typeof b === "object" ? b : {});
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Allow": "GET, HEAD" });
    return res.end();
  }

  const rawFile = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.resolve(PUBLIC, "." + path.normalize("/" + rawFile));
  if (!safePath.startsWith(PUBLIC + path.sep) && safePath !== PUBLIC) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }

  fs.readFile(safePath, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(safePath)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    res.end(buf);
  });
}).listen(PORT, () => console.log("Context Duel running on http://localhost:" + PORT));
