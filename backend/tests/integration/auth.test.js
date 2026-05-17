const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../server')

describe('Auth API', () => {
  afterAll(async () => {
    await mongoose.disconnect()
  })

  it('POST /api/auth/register should return 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'TestUser',
        email: 'testuser@test.com',
        password: '123456'
      })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  it('POST /api/auth/login should return 200', async () => {
    const res = await request(app)
    .post('/api/auth/login')
    .send({
        email: 'testuser@test.com',
        password:'123456'
    })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })
})