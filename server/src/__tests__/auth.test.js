import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { startDb, stopDb } from './setup.js';

before(async () => {
  await startDb();
});

after(async () => {
  await stopDb();
});

describe('GET /api/v1/health', () => {
  it('reports the API is healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.uptime, 'number');
  });
});

describe('POST /api/v1/auth/register', () => {
  it('registers a doctor account', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Doctor',
      email: 'doctor@medi.co',
      password: 'Password123!',
      role: 'Doctor',
      department: 'Cardiology',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, 'doctor@medi.co');
    assert.equal(res.body.data.password, undefined);
  });

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Second Doctor',
      email: 'doctor@medi.co',
      password: 'Password123!',
      role: 'Doctor',
    });
    assert.equal(res.status, 409);
  });

  it('rejects an invalid role with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin Hopeful',
      email: 'boss@medi.co',
      password: 'Password123!',
      role: 'Admin',
    });
    assert.equal(res.status, 400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('sets auth cookies and returns the user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'doctor@medi.co',
      password: 'Password123!',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, 'doctor@medi.co');
    const setCookies = res.headers['set-cookie'];
    assert.equal(Array.isArray(setCookies), true);
    const joined = Array.isArray(setCookies) ? setCookies.join('') : '';
    assert.ok(joined.includes('accessToken='));
    assert.ok(joined.includes('refreshToken='));
  });

  it('rejects bad credentials with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'doctor@medi.co',
      password: 'wrong-password',
    });
    assert.equal(res.status, 401);
  });
});

describe('GET /api/v1/medicines', () => {
  it('is publicly accessible', async () => {
    const res = await request(app).get('/api/v1/medicines');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Array.isArray(res.body.data), true);
  });
});
