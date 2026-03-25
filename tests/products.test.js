// tests/products.test.js
require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

// Helper: generate a signed JWT for tests
const makeToken = (role = 'CUSTOMER') =>
  jwt.sign(
    { id: 'user-uuid-1', email: 'user@test.com', role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const mockProducts = [
  { id: 'prod-1', name: 'Wireless Headphones', description: 'Premium noise-cancelling headphones', price: 129.99, stock: 50, category: 'Electronics', createdAt: new Date() },
  { id: 'prod-2', name: 'Mechanical Keyboard', description: 'RGB backlit, tactile switches', price: 89.99, stock: 30, category: 'Electronics', createdAt: new Date() },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// ── GET /api/products ──────────────────────────────────────────────────────
describe('GET /api/products', () => {
  it('should return paginated list of products', async () => {
    prisma.product.findMany.mockResolvedValue(mockProducts);
    prisma.product.count.mockResolvedValue(2);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.pages).toBe(1);
  });

  it('should support category filter', async () => {
    prisma.product.findMany.mockResolvedValue([mockProducts[0]]);
    prisma.product.count.mockResolvedValue(1);

    const res = await request(app).get('/api/products?category=Electronics');

    expect(res.status).toBe(200);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'Electronics' }) })
    );
  });

  it('should not require authentication', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
  });
});

// ── GET /api/products/:id ──────────────────────────────────────────────────
describe('GET /api/products/:id', () => {
  it('should return a single product', async () => {
    prisma.product.findUnique.mockResolvedValue(mockProducts[0]);

    const res = await request(app).get('/api/products/prod-1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('prod-1');
    expect(res.body.name).toBe('Wireless Headphones');
  });

  it('should return 404 if product not found', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/products/non-existent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });
});

// ── POST /api/products ─────────────────────────────────────────────────────
describe('POST /api/products', () => {
  const newProduct = {
    name: 'Smart Watch',
    description: 'Fitness tracker with AMOLED display',
    price: 199.99,
    stock: 40,
    category: 'Electronics',
  };

  it('should create product when user is ADMIN', async () => {
    prisma.product.create.mockResolvedValue({ id: 'prod-3', ...newProduct });

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${makeToken('ADMIN')}`)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Smart Watch');
  });

  it('should return 403 if user is not ADMIN', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${makeToken('CUSTOMER')}`)
      .send(newProduct);

    expect(res.status).toBe(403);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).post('/api/products').send(newProduct);
    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid product data', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${makeToken('ADMIN')}`)
      .send({ name: 'X', price: -10 }); // invalid

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

// ── DELETE /api/products/:id ───────────────────────────────────────────────
describe('DELETE /api/products/:id', () => {
  it('should delete product as ADMIN', async () => {
    prisma.product.delete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/products/prod-1')
      .set('Authorization', `Bearer ${makeToken('ADMIN')}`);

    expect(res.status).toBe(204);
  });

  it('should return 403 for CUSTOMER', async () => {
    const res = await request(app)
      .delete('/api/products/prod-1')
      .set('Authorization', `Bearer ${makeToken('CUSTOMER')}`);

    expect(res.status).toBe(403);
  });
});
