import { Router } from 'express';
import { createPRD, getPRD } from '../controllers/prdController';

const router = Router();

router.post('/', createPRD);
router.get('/:id', getPRD);

export default router;