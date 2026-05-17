jest.mock("../../src/models/User.model");
const User = require("../../src/models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { register,login } = require("../../src/controllers/auth.controller");

describe("Auth Controller", () => {
  it("should return 400 if user already exists", async () => {
    User.findOne = jest.fn().mockResolvedValue({ email: "test@test.com" });

    const req = {
      body: { username: "Test", email: "test@test.com", password: "123456" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 400 if password is wrong", async () => {
    User.findOne = jest.fn().mockResolvedValue({
      email: "test@test.com",
      password: "hashedpassword",
    });
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const req = {
      body: { email: "test@test.com", password: "wrongpassword" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
