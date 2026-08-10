import request from 'supertest';
import app from '../app.js';

describe('GET /api/v1/health', () => {
  it('reports the API is healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.uptime).toBe('number');
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
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('doctor@medi.co');
    expect(res.body.data.password).toBeUndefined();
  });

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Second Doctor',
      email: 'doctor@medi.co',
      password: 'Password123!',
      role: 'Doctor',
    });
    expect(res.status).toBe(409);
  });

  it('rejects an invalid role with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin Hopeful',
      email: 'boss@medi.co',
      password: 'Password123!',
      role: 'Admin',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('sets auth cookies and returns the user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'doctor@medi.co',
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('doctor@medi.co');
    const setCookies = res.headers['set-cookie'];
    expect(Array.isArray(setCookies)).toBe(true);
    const joined = Array.isArray(setCookies) ? setCookies.join('') : '';
    expect(joined).toContain('accessToken=');
    expect(joined).toContain('refreshToken=');
  });

  it('rejects bad credentials with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'doctor@medi.co',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/medicines', () => {
  it('is publicly accessible', async () => {
    const res = await request(app).get('/api/v1/medicines');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});