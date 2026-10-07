"""Smoke checks for the optional Flask host; the game itself stays fully static."""
import unittest
from app import app

class HostTest(unittest.TestCase):
    def test_serves_the_same_game_and_module(self):
        with app.test_client() as client:
            home = client.get('/')
            self.assertEqual(home.status_code, 200)
            self.assertIn(b'Keep it in play.', home.data)
            with client.get('/engine.js') as module:
                self.assertEqual(module.status_code, 200)
            self.assertEqual(client.get('/missing.js').status_code, 404)
            self.assertEqual(client.get('/../README.md').status_code, 404)
            home.close()

if __name__ == '__main__':
    unittest.main()
