import { Router } from 'express';
import { EpisodeController } from '../controllers/episodeController.js';

const router = Router();

router.get('/', EpisodeController.getEpisodes);
router.get('/:id', EpisodeController.getEpisodeById);

export default router;
