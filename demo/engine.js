export const WIDTH = 800,
  HEIGHT = 500,
  PADDLE_HEIGHT = 88,
  PADDLE_WIDTH = 12,
  BALL_RADIUS = 8,
  WIN_SCORE = 7;
export const LEVELS = {
  relaxed: { speed: 230, ai: 175 },
  standard: { speed: 320, ai: 255 },
  quick: { speed: 400, ai: 330 },
};
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function createGame(level = "standard") {
  if (!Object.hasOwn(LEVELS, level)) throw new RangeError("Unknown difficulty");
  return {
    level,
    phase: "ready",
    left: { y: 206, score: 0 },
    right: { y: 206, score: 0 },
    ball: { x: 400, y: 250, vx: 0, vy: 0, speed: LEVELS[level].speed },
    rally: 0,
    bestRally: 0,
    serveDirection: 1,
    winner: null,
  };
}
export function start(game) {
  if (game.phase === "paused") {
    game.phase = "playing";
    return;
  }
  if (game.phase !== "ready") return;
  const speed = LEVELS[game.level].speed;
  Object.assign(game.ball, {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    speed,
    vx: game.serveDirection * speed * Math.cos(0.22),
    vy: speed * Math.sin(0.22),
  });
  game.rally = 0;
  game.phase = "playing";
}
export function pause(game) {
  if (game.phase === "playing") game.phase = "paused";
}
export function positionPlayer(game, y) {
  game.left.y = clamp(y - PADDLE_HEIGHT / 2, 0, HEIGHT - PADDLE_HEIGHT);
}
function point(game, side) {
  game[side].score++;
  game.serveDirection = side === "left" ? 1 : -1;
  Object.assign(game.ball, {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 0,
    vy: 0,
    speed: LEVELS[game.level].speed,
  });
  game.rally = 0;
  game.phase = game[side].score >= WIN_SCORE ? "over" : "ready";
  if (game.phase === "over") game.winner = side;
}
function bounce(game, side) {
  const ball = game.ball,
    paddle = game[side];
  const fraction = clamp(
    (ball.y - paddle.y - PADDLE_HEIGHT / 2) / (PADDLE_HEIGHT / 2),
    -1,
    1,
  );
  ball.speed = Math.min(720, ball.speed * 1.045);
  ball.vx =
    (side === "left" ? 1 : -1) *
    ball.speed *
    Math.cos((fraction * Math.PI) / 4);
  ball.vy = ball.speed * Math.sin((fraction * Math.PI) / 4);
  ball.x =
    side === "left"
      ? 32 + PADDLE_WIDTH + BALL_RADIUS
      : WIDTH - 32 - PADDLE_WIDTH - BALL_RADIUS;
  game.rally++;
  game.bestRally = Math.max(game.bestRally, game.rally);
}
export function advance(game, seconds, keyboard = 0) {
  if (game.phase !== "playing" || !Number.isFinite(seconds) || seconds <= 0)
    return;
  const dt = Math.min(seconds, 0.05),
    steps = Math.ceil(dt / (1 / 240)),
    step = dt / steps;
  for (let i = 0; i < steps && game.phase === "playing"; i++) {
    game.left.y = clamp(
      game.left.y + clamp(keyboard, -1, 1) * 460 * step,
      0,
      HEIGHT - PADDLE_HEIGHT,
    );
    const b = game.ball;
    const target =
      b.vx > 0 ? b.y - PADDLE_HEIGHT / 2 : HEIGHT / 2 - PADDLE_HEIGHT / 2;
    game.right.y = clamp(
      game.right.y +
        clamp(
          target - game.right.y,
          -LEVELS[game.level].ai * step,
          LEVELS[game.level].ai * step,
        ),
      0,
      HEIGHT - PADDLE_HEIGHT,
    );
    const oldX = b.x;
    b.x += b.vx * step;
    b.y += b.vy * step;
    if (b.y < BALL_RADIUS) {
      b.y = 2 * BALL_RADIUS - b.y;
      b.vy = Math.abs(b.vy);
    }
    if (b.y > HEIGHT - BALL_RADIUS) {
      b.y = 2 * (HEIGHT - BALL_RADIUS) - b.y;
      b.vy = -Math.abs(b.vy);
    }
    const leftPlane = 32 + PADDLE_WIDTH + BALL_RADIUS,
      rightPlane = WIDTH - 32 - PADDLE_WIDTH - BALL_RADIUS;
    if (
      b.vx < 0 &&
      oldX >= leftPlane &&
      b.x <= leftPlane &&
      b.y + BALL_RADIUS >= game.left.y &&
      b.y - BALL_RADIUS <= game.left.y + PADDLE_HEIGHT
    )
      bounce(game, "left");
    else if (
      b.vx > 0 &&
      oldX <= rightPlane &&
      b.x >= rightPlane &&
      b.y + BALL_RADIUS >= game.right.y &&
      b.y - BALL_RADIUS <= game.right.y + PADDLE_HEIGHT
    )
      bounce(game, "right");
    if (b.x < -BALL_RADIUS) point(game, "right");
    else if (b.x > WIDTH + BALL_RADIUS) point(game, "left");
  }
}
