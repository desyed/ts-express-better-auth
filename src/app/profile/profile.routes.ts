import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the profile
 *     tags:
 *       - /api
 *     responses:
 *       200:
 *         description: The profile
 */
router.get('/', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

export default router;
