import { Router } from 'express';
import { FeedSourceController } from '../controllers/feedSourceController.js';

const router = Router();

router.get('/', FeedSourceController.getFeedSources);
router.post('/', FeedSourceController.addFeedSource);
router.post('/sync-all', FeedSourceController.syncAllFeedSources);
router.post('/preview', FeedSourceController.previewFeed);
router.get('/:id', FeedSourceController.getFeedSourceById);
router.post('/:id/sync', FeedSourceController.syncFeedSource);
router.delete('/:id', FeedSourceController.deleteFeedSource);

export default router;
