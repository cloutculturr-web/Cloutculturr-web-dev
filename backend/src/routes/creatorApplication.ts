import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import CreatorApplicationController from '@/controllers/creatorApplicationController.js';
import { handleValidationErrors } from '@/middleware/validation.js';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILES_PER_APPLICATION } from '@/utils/fileStorage.js';

const router = Router();

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many applications submitted from this address. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES_PER_APPLICATION },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Unsupported file type — only JPG, PNG, WEBP, and PDF are accepted'));
      return;
    }
    cb(null, true);
  },
});

router.post(
  '/',
  applicationLimiter,
  upload.array('portfolioFiles', MAX_FILES_PER_APPLICATION),
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('companyName').trim().notEmpty().withMessage('Company/brand name is required'),
    body('bio').trim().isLength({ min: 20, max: 1000 }).withMessage('Bio must be between 20 and 1000 characters'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative number'),
    body('proposedPricing').optional().isFloat({ min: 0 }).withMessage('Proposed pricing must be a positive number'),
  ],
  handleValidationErrors,
  CreatorApplicationController.submit
);

export default router;
