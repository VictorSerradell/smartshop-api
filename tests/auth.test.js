// tests/auth.test.js
require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const mockUser = {
  id: 'user-uuid-1',
  name: 'John Doe',
  email: 'john@test.com',
  password: bcrypt.hashSync('password123', 10),
  role: 'CUSTOMER',
  refreshToken: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ── POST /api/auth/register ────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(mockUser);
    prisma.user.update.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('john@test.com');
  });

  it('should return 409 if email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John',
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details[0].field).toBe('email');
  });

  it('should return 400 if password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John',
      email: 'john@test.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('password');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('should login with correct credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.user.update.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should return 401 for wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@test.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should return 401 if user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
