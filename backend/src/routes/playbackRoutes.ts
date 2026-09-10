import { Router } from 'express';
import { PlaybackController } from '../controllers/playbackController.js';

const router = Router();

router.post('/progress', PlaybackController.saveProgress);
router.get('/recent', PlaybackController.getRecentlyPlayed);
router.get('/progress/:episodeId', PlaybackController.getProgress);

export default router;
