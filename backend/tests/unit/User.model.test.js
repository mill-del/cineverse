const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../src/models/User.model");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User model validation", () => {
  it("Should fall without username", async () => {
    const user = new User({ email: "test@test.com", password: "1234567" });
    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it("Should fall without email", async () => {
    const user = new User({ username: "Malika", password: "1234567" });
    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it("Should create user successfully", async () => {
    const user = new User({
      email: "malika@example.com",
      username: "Malika",
      password: "1234567",
    });
    const saved = await user.save();
    expect(saved._id).toBeDefined();
    expect(saved.username).toBe("Malika");
  });
});
