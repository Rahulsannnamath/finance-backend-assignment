import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import app (without starting the server listener)
import app from '../server.js';

let adminToken;
let analystToken;
let viewerToken;
let createdUserId;

describe('Auth API', () => {
  // ─── Registration ───
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: `testuser_${Date.now()}@test.com`,
        password: 'testpass123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user.role).toBe('viewer'); // Default role
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'incomplete@test.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'testpass123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      const email = `dup_${Date.now()}@test.com`;

      await request(app).post('/api/auth/register').send({
        name: 'First', email, password: 'testpass123',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Second', email, password: 'testpass123',
      });

      expect(res.status).toBe(409);
    });
  });

  // ─── Login ───
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials (admin)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@finance.com',
        password: 'admin123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      adminToken = res.body.data.token;
    });

    it('should login as analyst', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'analyst@finance.com',
        password: 'analyst123',
      });

      expect(res.status).toBe(200);
      analystToken = res.body.data.token;
    });

    it('should login as viewer', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'viewer@finance.com',
        password: 'viewer123',
      });

      expect(res.status).toBe(200);
      viewerToken = res.body.data.token;
    });

    it('should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@finance.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'testpass123',
      });

      expect(res.status).toBe(401);
    });
  });

  // ─── Profile ───
  describe('GET /api/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', 'admin@finance.com');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
    });
  });
});
