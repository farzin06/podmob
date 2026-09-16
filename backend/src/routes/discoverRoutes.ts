import { Router } from 'express';
import { DiscoverController } from '../controllers/discoverController.js';

const router = Router();

router.get('/search', DiscoverController.search);
router.get('/trending', DiscoverController.getTrending);
router.get('/categories', DiscoverController.getCategories);
router.get('/lookup', DiscoverController.lookup);
router.get('/lookup/:id', DiscoverController.lookup);
router.post('/subscribe', DiscoverController.subscribe);

export default router;
