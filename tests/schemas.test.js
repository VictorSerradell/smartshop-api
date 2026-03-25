// tests/schemas.test.js
require('./setup');
const {
  registerSchema,
  loginSchema,
  productSchema,
  cartItemSchema,
} = require('../src/utils/schemas');

// ── registerSchema ─────────────────────────────────────────────────────────
describe('registerSchema', () => {
  it('should pass with valid data', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should fail with short name', () => {
    const result = registerSchema.safeParse({ name: 'J', email: 'j@test.com', password: 'pass123' });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('name');
  });

  it('should fail with invalid email', () => {
    const result = registerSchema.safeParse({ name: 'John', email: 'not-email', password: 'pass123' });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('email');
  });

  it('should fail with short password', () => {
    const result = registerSchema.safeParse({ name: 'John', email: 'j@test.com', password: '123' });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('password');
  });
});

// ── loginSchema ────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  it('should pass with valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'john@test.com', password: 'pass' });
    expect(result.success).toBe(true);
  });

  it('should fail with missing password', () => {
    const result = loginSchema.safeParse({ email: 'john@test.com' });
    expect(result.success).toBe(false);
  });
});

// ── productSchema ──────────────────────────────────────────────────────────
describe('productSchema', () => {
  const valid = {
    name: 'Smart Watch',
    description: 'Fitness tracker with AMOLED display',
    price: 199.99,
    stock: 40,
    category: 'Electronics',
  };

  it('should pass with valid product data', () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it('should fail with negative price', () => {
    const result = productSchema.safeParse({ ...valid, price: -10 });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('price');
  });

  it('should fail with negative stock', () => {
    const result = productSchema.safeParse({ ...valid, stock: -5 });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('stock');
  });

  it('should fail with invalid imageUrl', () => {
    const result = productSchema.safeParse({ ...valid, imageUrl: 'not-a-url' });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('imageUrl');
  });

  it('should pass without optional imageUrl', () => {
    const { imageUrl, ...withoutImage } = valid;
    expect(productSchema.safeParse(withoutImage).success).toBe(true);
  });
});

// ── cartItemSchema ─────────────────────────────────────────────────────────
describe('cartItemSchema', () => {
  it('should pass with valid cart item', () => {
    const result = cartItemSchema.safeParse({
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it('should fail with invalid UUID', () => {
    const result = cartItemSchema.safeParse({ productId: 'bad-id', quantity: 1 });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('productId');
  });

  it('should fail with zero quantity', () => {
    const result = cartItemSchema.safeParse({
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should default quantity to 1 if not provided', () => {
    const result = cartItemSchema.safeParse({
      productId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
    expect(result.data.quantity).toBe(1);
  });
});
