import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { upload } from '../config/multer';
import { parseResume } from '../controllers/resumeParser/parseResume';

const router = Router();

router.use(authenticate);

router.post('/parse', upload.single('resume'), parseResume);

export default router;
