# Browser Pong

A small Pong game rendered with JavaScript and HTML Canvas, served by a minimal Flask application.

## Run locally

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install flask
python app.py
```

Open `http://127.0.0.1:5000`. Move your mouse over the canvas to control the left paddle; the right paddle follows the ball automatically. Scores increase when the ball passes a paddle. The current implementation continues indefinitely and has no first-to-ten win condition.

## How it works

- `app.py`: serves one page through Flask.
- `templates/pong.html`: canvas rendering, collision detection, computer paddle movement, and scoring.

The canvas is fixed at 800 × 600 pixels and uses mouse input. Touch controls, responsive sizing, multiplayer, persistence, and a leaderboard are not implemented.

## Development status

A learning prototype with no pinned dependency environment or automated tests. `app.py` enables Flask’s development debugger; use it for local development. The commands above reflect the source structure but have not been runtime-tested in this documentation pass.

No license file is currently included; the previous README’s MIT-license claim has been removed.
