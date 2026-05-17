const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");

describe("Movies API", () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("GET /api/movies should return 200 and array", async () => {
    const res = await request(app).get("/api/movies");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
