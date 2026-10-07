# Browser Pong

A complete first-to-seven Pong match with pointer, touch and keyboard controls, three speeds, pause/resume, match reset, and a capped-speed computer opponent.

**[Play Pong](https://elliottbarnes.github.io/pong/)** · [Game engine](demo/engine.js) · [Tests](tests/engine.test.js)

## Run locally

No install or server framework is needed for the static game:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory demo
```

Open `http://127.0.0.1:8000`. Move inside the court or use W/S or the arrow keys. Space starts or pauses. Each point waits for a new serve; seven points ends the match. The game pauses when the tab loses focus.

The optional `app.py` Flask host serves the same `demo/` files on `127.0.0.1:5000`, with debugging disabled. Flask is not required for the game or deployment. If you need that host, create a virtual environment, run `python -m pip install -r requirements.txt`, then `python app.py`. Flask is pinned in `requirements.txt`. Run its smoke test with `python -m unittest discover -s tests -p "test_*.py"`. The old template is a redirect rather than a second game implementation.

## Development and verification

With Node.js 24:

```sh
node --test
node scripts/build-demo.mjs
```

The pure engine separates game state from drawing. Physics uses bounded time steps, paddle-crossing checks, a maximum ball speed, and a full velocity reset between points. Tests exercise collisions, score transitions, match completion, paused state, clamped input, and large frame gaps.

GitHub Actions runs the tests and syntax checks before deploying only `demo/` through an explicit `dist/` artifact. `build.json` identifies the source commit and hashes of published files. All visuals are drawn with Canvas and CSS. The browser game has no runtime dependencies, network requests, accounts, telemetry, or saved scores.

This completes the original Canvas learning prototype as a single-player browser game. Multiplayer, ranked play, and persistence are outside its scope. Keyboard users can operate the controls and read score/status text; the moving-ball game still requires visual tracking. No license has been added or inferred.
