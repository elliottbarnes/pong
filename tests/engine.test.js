import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  start,
  pause,
  advance,
  positionPlayer,
  HEIGHT,
  PADDLE_HEIGHT,
  WIN_SCORE,
  LEVELS,
} from "../demo/engine.js";
test("new match waits for an explicit serve", () => {
  const g = createGame();
  advance(g, 1);
  assert.equal(g.ball.x, 400);
  start(g);
  advance(g, 0.02);
  assert.ok(g.ball.x > 400);
});
test("pause preserves the entire match until resumed", () => {
  const g = createGame();
  start(g);
  pause(g);
  const before = structuredClone(g);
  advance(g, 0.05, 1);
  assert.deepEqual(g, before);
  start(g);
  assert.equal(g.phase, "playing");
});
test("pointer and keyboard paddles stay on court", () => {
  const g = createGame();
  positionPlayer(g, -100);
  assert.equal(g.left.y, 0);
  positionPlayer(g, 10000);
  assert.equal(g.left.y, HEIGHT - PADDLE_HEIGHT);
  start(g);
  for (let i = 0; i < 100; i++) advance(g, 0.05, 1);
  assert.ok(g.left.y <= HEIGHT - PADDLE_HEIGHT);
});
test("ball bounces from ceiling and floor without escaping", () => {
  for (const [y, vy] of [
    [9, -500],
    [491, 500],
  ]) {
    const g = createGame();
    start(g);
    Object.assign(g.ball, { y, vy });
    advance(g, 0.03);
    assert.ok(g.ball.y >= 8 && g.ball.y <= 492);
    assert.equal(Math.sign(g.ball.vy), -Math.sign(vy));
  }
});
test("fast ball crossing a paddle is reflected only once", () => {
  const g = createGame();
  start(g);
  Object.assign(g.ball, { x: 65, y: 250, vx: -720, vy: 0, speed: 720 });
  advance(g, 0.05);
  assert.ok(g.ball.vx > 0);
  assert.equal(g.rally, 1);
  assert.ok(g.ball.x >= 52);
});
test("missing a paddle scores once and resets both velocity components", () => {
  const g = createGame();
  start(g);
  g.left.y = 350;
  Object.assign(g.ball, { x: -7, y: 60, vx: -400, vy: 90 });
  advance(g, 0.05);
  assert.equal(g.right.score, 1);
  assert.equal(g.phase, "ready");
  assert.equal(g.ball.vx, 0);
  assert.equal(g.ball.vy, 0);
  advance(g, 0.05);
  assert.equal(g.right.score, 1);
  start(g);
  assert.ok(Math.abs(g.ball.vx) <= LEVELS.standard.speed);
});
test("seven points ends the match and freezes scoring", () => {
  const g = createGame();
  start(g);
  g.left.score = WIN_SCORE - 1;
  Object.assign(g.ball, { x: 807, y: 10, vx: 400, vy: 0 });
  advance(g, 0.05);
  assert.equal(g.winner, "left");
  assert.equal(g.phase, "over");
  advance(g, 1);
  start(g);
  assert.equal(g.left.score, WIN_SCORE);
  assert.equal(g.phase, "over");
});
test("huge frame gaps are bounded and invalid delta times ignored", () => {
  const a = createGame(),
    b = createGame();
  start(a);
  start(b);
  advance(a, 40);
  advance(b, 0.05);
  assert.deepEqual(a, b);
  const c = structuredClone(a);
  advance(a, NaN);
  advance(a, -1);
  assert.deepEqual(a, c);
});
