import unittest
from model.ats_scorer import predict_ats_score

class TestAtsScorer(unittest.TestCase):
    def test_ats_score(self):
        score = predict_ats_score([5, 3])  # Example: 5 skills, 3 years exp
        self.assertTrue(0 <= score <= 100)

if __name__ == '__main__':
    unittest.main()
