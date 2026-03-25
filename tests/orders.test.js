// tests/orders.test.js
require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const makeToken = (role = 'CUSTOMER') =>
  jwt.sign(
    { id: 'user-uuid-1', email: 'user@test.com', role },
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
      quantity: 2,
      product: { id: 'prod-1', name: 'Headphones', price: 129.99 },
    },
  ],
};

const mockOrder = {
  id: 'order-1',
  userId: 'user-uuid-1',
  total: 259.98,
  status: 'PENDING',
  items: mockCart.items,
  createdAt: new Date(),
};

beforeEach(() => jest.clearAllMocks());

// ── GET /api/orders ────────────────────────────────────────────────────────
describe('GET /api/orders', () => {
  it('should return user orders', async () => {
    prisma.order.findMany.mockResolvedValue([mockOrder]);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe('order-1');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/orders ───────────────────────────────────────────────────────
describe('POST /api/orders', () => {
  it('should create order from cart and clear it', async () => {
    prisma.cart.findUnique.mockResolvedValue(mockCart);
    prisma.order.create.mockResolvedValue(mockOrder);
    prisma.cartItem.deleteMany.mockResolvedValue({});

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(259.98);
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1' },
    });
  });

  it('should return 400 if cart is empty', async () => {
    prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cart is empty');
  });

  it('should return 400 if cart does not exist', async () => {
    prisma.cart.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(400);
  });
});

// ── GET /api/orders/:id ────────────────────────────────────────────────────
describe('GET /api/orders/:id', () => {
  it('should return a single order by id', async () => {
    prisma.order.findFirst.mockResolvedValue(mockOrder);

    const res = await request(app)
      .get('/api/orders/order-1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('order-1');
  });

  it('should return 404 if order not found', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/orders/non-existent')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Order not found');
  });
});
