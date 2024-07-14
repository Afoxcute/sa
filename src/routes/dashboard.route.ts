import express, { Router } from 'express';
import { protect } from '../middlewares';
import multer from 'multer';
import { account, uploadProfileImage } from '../controllers/Dashboard';

const router: Router = express.Router();
const storage: multer.StorageEngine = multer.memoryStorage();
const upload: multer.Multer = multer({ storage: storage });

router.use(protect);

router.get('/account', account);
router.put('/upload-image', upload.single('profile_image'), uploadProfileImage);

export default router;
