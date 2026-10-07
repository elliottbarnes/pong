import {
  createGame,
  start,
  pause,
  positionPlayer,
  advance,
  WIDTH,
  HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  BALL_RADIUS,
} from "./engine.js";
const $ = (id) => document.getElementById(id),
  canvas = $("court"),
  ctx = canvas.getContext("2d");
let game = createGame(),
  last = 0,
  lastSummary = "",
  keys = new Set();
function act() {
  if (game.phase === "over") game = createGame($("difficulty").value);
  if (game.phase === "playing") pause(game);
  else start(game);
  canvas.focus();
  sync();
}
$("play").addEventListener("click", act);
$("reset").addEventListener("click", () => {
  game = createGame($("difficulty").value);
  keys.clear();
  sync();
});
$("difficulty").addEventListener("change", () => {
  game = createGame($("difficulty").value);
  keys.clear();
  sync();
});
function pointer(event) {
  const rect = canvas.getBoundingClientRect();
  positionPlayer(game, ((event.clientY - rect.top) * HEIGHT) / rect.height);
}
canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  pointer(event);
  canvas.focus();
});
canvas.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || event.buttons) pointer(event);
});
canvas.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "w", "s", " "].includes(key)) {
    event.preventDefault();
    if (key === " ") {
      if (!event.repeat) act();
    } else keys.add(key);
  }
});
canvas.addEventListener("keyup", (event) =>
  keys.delete(event.key.toLowerCase()),
);
function leave() {
  keys.clear();
  pause(game);
  sync();
}
window.addEventListener("blur", leave);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) leave();
});
canvas.addEventListener("blur", () => keys.clear());
function sync() {
  $("you").textContent = game.left.score;
  $("computer").textContent = game.right.score;
  $("rally").textContent = game.bestRally;
  $("phase").textContent = {
    ready: "READY TO SERVE",
    playing: "BALL IN PLAY",
    paused: "PAUSED",
    over: "MATCH COMPLETE",
  }[game.phase];
  $("play").textContent = {
    ready: game.left.score + game.right.score ? "Serve" : "Start match",
    playing: "Pause",
    paused: "Resume",
    over: "Play again",
  }[game.phase];
  const summary = `${game.phase}:${game.left.score}:${game.right.score}`;
  if (summary !== lastSummary) {
    lastSummary = summary;
    $("status").textContent = {
      ready: `You ${game.left.score} · Computer ${game.right.score}. Press ${game.left.score + game.right.score ? "Serve" : "Start match"} or Space when you are ready.`,
      playing: "Ball in play. First to seven wins.",
      paused: "Paused. Resume whenever you are ready.",
      over:
        game.winner === "left"
          ? "You win the match. Play again for a rematch."
          : "The computer takes this match. Ready for a rematch?",
    }[game.phase];
  }
}
function draw() {
  ctx.fillStyle = "#10151e";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "#343e4d";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 24);
  ctx.lineTo(WIDTH / 2, HEIGHT - 24);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#26313e";
  ctx.strokeRect(18, 18, WIDTH - 36, HEIGHT - 36);
  ctx.fillStyle = "#b0e882";
  ctx.fillRect(32, game.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = "#aab5c6";
  ctx.fillRect(
    WIDTH - 32 - PADDLE_WIDTH,
    game.right.y,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  );
  ctx.fillStyle = "#edf1f6";
  ctx.beginPath();
  ctx.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  if (game.phase !== "playing") {
    ctx.fillStyle = "rgba(16,21,30,.65)";
    ctx.fillRect(110, HEIGHT / 2 - 64, WIDTH - 220, 128);
    ctx.fillStyle = "#edf1f6";
    ctx.font = "600 26px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      {
        ready: "READY WHEN YOU ARE",
        paused: "TAKE A BREATHER",
        over: game.winner === "left" ? "YOU WIN" : "MATCH COMPLETE",
      }[game.phase],
      WIDTH / 2,
      HEIGHT / 2 - 7,
    );
    ctx.font = "15px system-ui";
    ctx.fillStyle = "#aab5c6";
    ctx.fillText(
      game.phase === "over"
        ? "Choose Play again for a rematch"
        : "Press the button or Space to play",
      WIDTH / 2,
      HEIGHT / 2 + 24,
    );
  }
}
function frame(time) {
  if (last)
    advance(
      game,
      (time - last) / 1000,
      (keys.has("arrowdown") || keys.has("s") ? 1 : 0) -
        (keys.has("arrowup") || keys.has("w") ? 1 : 0),
    );
  last = time;
  sync();
  draw();
  requestAnimationFrame(frame);
}
sync();
requestAnimationFrame(frame);
