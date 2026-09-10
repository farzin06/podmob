import { Router } from 'express';
import { PodcastController } from '../controllers/podcastController.js';

const router = Router();

router.get('/', PodcastController.getPodcasts);
router.get('/creators', PodcastController.getCreators);
router.get('/:id', PodcastController.getPodcastById);
router.delete('/:id', PodcastController.deletePodcast);

export default router;
