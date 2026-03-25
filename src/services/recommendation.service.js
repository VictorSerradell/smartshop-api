// src/services/recommendation.service.js
const OpenAI = require('openai');
const prisma = require('../config/prisma');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getRecommendations = async (userId) => {
  // Fetch user order history
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Fetch available products
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    take: 20,
  });

  if (products.length === 0) return [];

  // Build context for the AI
  const purchasedItems = orders
    .flatMap((o) => o.items.map((i) => `${i.product.name} (${i.product.category})`))
    .join(', ') || 'No previous purchases';

  const availableProducts = products
    .map((p) => `ID:${p.id} | ${p.name} | ${p.category} | $${p.price}`)
    .join('\n');

  const prompt = `
You are a smart e-commerce recommendation engine.

User's purchase history: ${purchasedItems}

Available products:
${availableProducts}

Return a JSON array with the 3 most relevant product IDs for this user, 
and a short reason for each. Format:
[{ "productId": "...", "reason": "..." }]

Only return the JSON array, nothing else.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const raw = completion.choices[0].message.content.trim();
  const recommendations = JSON.parse(raw);

  // Enrich with full product data
  return Promise.all(
    recommendations.map(async ({ productId, reason }) => {
      const product = products.find((p) => p.id === productId);
      return { product, reason };
    })
  );
};

module.exports = { getRecommendations };
