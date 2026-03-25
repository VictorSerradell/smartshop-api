// src/routes/recommendation.routes.js
const { Router } = require('express');
const { getRecommendations } = require('../services/recommendation.service');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered product recommendations
 */

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get personalized product recommendations (AI)
 *     tags: [AI]
 *     description: Uses OpenAI to analyze purchase history and suggest relevant products.
 *     responses:
 *       200:
 *         description: List of recommended products with reasons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product:
 *                     type: object
 *                   reason:
 *                     type: string
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(req.user.id);
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
