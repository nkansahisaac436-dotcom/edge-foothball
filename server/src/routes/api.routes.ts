import { Router } from 'express';
import { FixturesController } from '../controllers/fixtures.controller.js';
import { PredictionsController } from '../controllers/predictions.controller.js';

const router = Router();

// League endpoints
router.get('/leagues', FixturesController.getLeagues);
router.get('/standings', FixturesController.getStandings);

// Fixtures & Live endpoints
router.get('/fixtures', FixturesController.getFixtures);
router.get('/live', FixturesController.getLiveFixtures);
router.get('/live/stream', FixturesController.getLiveStream);

// Match predictions
router.get('/match/:id/predictions', PredictionsController.getMatchPredictions);

// Best picks
router.get('/picks/strongest', PredictionsController.getStrongestPicks);
router.get('/picks/value', PredictionsController.getValuePicks);

// Custom match simulation
router.post('/custom-match', PredictionsController.customMatch);

// Backtest execution & reporting
router.get('/backtest', PredictionsController.getBacktest);

export default router;
