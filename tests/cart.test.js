// tests/cart.test.js
require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const makeToken = () =>
  jwt.sign(
    { id: 'user-uuid-1', email: 'user@test.com', role: 'CUSTOMER' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const mockCart = {
  id: 'cart-1',
  userId: 'user-uuid-1',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      quantity: 1,
      product: { id: 'prod-1', name: 'Headphones', price: 129.99 },
    },
  ],
};

beforeEach(() => jest.clearAllMocks());

// ── GET /api/cart ──────────────────────────────────────────────────────────
describe('GET /api/cart', () => {
  it('should return user cart with items', async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it('should return empty cart if none exists', async () => {
    prisma.cart.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/cart/items ───────────────────────────────────────────────────
describe('POST /api/cart/items', () => {
  it('should add item to cart', async () => {
    prisma.cart.upsert.mockResolvedValue({ id: 'cart-1', userId: 'user-uuid-1' });
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({});
    prisma.cart.findUnique.mockResolvedValue(mockCart);

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 1 });

    expect(res.status).toBe(200);
    expect(prisma.cartItem.create).toHaveBeenCalled();
  });

  it('should increment quantity if item already in cart', async () => {
    prisma.cart.upsert.mockResolvedValue({ id: 'cart-1' });
    prisma.cartItem.findFirst.mockResolvedValue({ id: 'item-1', quantity: 1 });
    prisma.cartItem.update.mockResolvedValue({});
    prisma.cart.findUnique.mockResolvedValue(mockCart);

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 });

    expect(res.status).toBe(200);
    expect(prisma.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: 3 } })
    );
  });

  it('should return 400 for invalid productId (not UUID)', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ productId: 'bad-id', quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

// ── DELETE /api/cart/items/:itemId ─────────────────────────────────────────
describe('DELETE /api/cart/items/:itemId', () => {
  it('should remove item from cart', async () => {
    prisma.cartItem.delete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/cart/items/item-1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(204);
    expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
  });
});
