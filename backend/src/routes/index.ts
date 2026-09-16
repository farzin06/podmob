import { Router } from 'express';
import feedSourceRoutes from './feedSourceRoutes.js';
import podcastRoutes from './podcastRoutes.js';
import episodeRoutes from './episodeRoutes.js';
import playbackRoutes from './playbackRoutes.js';
import discoverRoutes from './discoverRoutes.js';

const router = Router();

router.use('/feed-sources', feedSourceRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/episodes', episodeRoutes);
router.use('/playback', playbackRoutes);
router.use('/discover', discoverRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'podmob-backend',
  });
});

export default router;
