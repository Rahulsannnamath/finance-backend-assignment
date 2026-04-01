import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();
import app from '../server.js';

let adminToken;
let viewerToken;
let analystToken;
let transactionId;

beforeAll(async () => {
  // Login as all roles
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@finance.com', password: 'admin123',
  });
  adminToken = adminRes.body.data.token;

  const viewerRes = await request(app).post('/api/auth/login').send({
    email: 'viewer@finance.com', password: 'viewer123',
  });
  viewerToken = viewerRes.body.data.token;

  const analystRes = await request(app).post('/api/auth/login').send({
    email: 'analyst@finance.com', password: 'analyst123',
  });
  analystToken = analystRes.body.data.token;
});

describe('Transaction API', () => {
  // ─── Create ───
  describe('POST /api/transactions', () => {
    it('admin should create a transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 1500.50,
          type: 'income',
          category: 'Salary',
          date: '2025-03-15',
          description: 'March salary',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.amount).toBe(1500.50);
      transactionId = res.body.data._id;
    });

    it('viewer should NOT create a transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 100, type: 'expense', category: 'Food',
        });

      expect(res.status).toBe(403);
    });

    it('analyst should NOT create a transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 100, type: 'expense', category: 'Food',
        });

      expect(res.status).toBe(403);
    });

    it('should reject invalid amount', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100, type: 'expense', category: 'Food',
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid category', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 100, type: 'expense', category: 'NotACategory',
        });

      expect(res.status).toBe(400);
    });
  });

  // ─── Read ───
  describe('GET /api/transactions', () => {
    it('all authenticated users can list transactions', async () => {
      for (const token of [adminToken, analystToken, viewerToken]) {
        const res = await request(app)
          .get('/api/transactions')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('transactions');
        expect(res.body.data).toHaveProperty('pagination');
      }
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    it('should support type filter', async () => {
      const res = await request(app)
        .get('/api/transactions?type=income')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const allIncome = res.body.data.transactions.every((t) => t.type === 'income');
      expect(allIncome).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
    });
  });

  // ─── Get by ID ───
  describe('GET /api/transactions/:id', () => {
    it('should get a transaction by ID', async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(transactionId);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .get('/api/transactions/invalidid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ─── Update ───
  describe('PATCH /api/transactions/:id', () => {
    it('admin should update a transaction', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 2000, description: 'Updated salary' });

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(2000);
    });

    it('viewer should NOT update a transaction', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ amount: 999 });

      expect(res.status).toBe(403);
    });
  });

  // ─── Delete ───
  describe('DELETE /api/transactions/:id', () => {
    it('viewer should NOT delete a transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it('admin should soft-delete a transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
