import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();
import app from '../server.js';

let adminToken;
let analystToken;
let viewerToken;

beforeAll(async () => {
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@finance.com', password: 'admin123',
  });
  adminToken = adminRes.body.data.token;

  const analystRes = await request(app).post('/api/auth/login').send({
    email: 'analyst@finance.com', password: 'analyst123',
  });
  analystToken = analystRes.body.data.token;

  const viewerRes = await request(app).post('/api/auth/login').send({
    email: 'viewer@finance.com', password: 'viewer123',
  });
  viewerToken = viewerRes.body.data.token;
});

describe('Dashboard API', () => {
  // ─── Summary ───
  describe('GET /api/dashboard/summary', () => {
    it('admin should access summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpenses');
      expect(res.body.data).toHaveProperty('netBalance');
      expect(res.body.data).toHaveProperty('totalRecords');
    });

    it('analyst should access summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
    });

    it('viewer should NOT access summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Category Breakdown ───
  describe('GET /api/dashboard/category-breakdown', () => {
    it('admin should access category breakdown', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('viewer should NOT access category breakdown', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Monthly Trends ───
  describe('GET /api/dashboard/trends', () => {
    it('admin should access monthly trends', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('analyst should access monthly trends', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ─── Recent Activity ───
  describe('GET /api/dashboard/recent', () => {
    it('admin should access recent activity', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it('viewer should NOT access recent activity', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
