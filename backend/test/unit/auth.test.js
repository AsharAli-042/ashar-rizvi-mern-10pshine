process.env.DATABASE_URL = process.env.DATABASE_URL || "mysql://x:y@localhost:3306/z";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";

const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const emailService = require("../../src/services/email.service");
const userModel = require("../../src/models/user.model");
const ApiError = require("../../src/utils/ApiError");
const authService = require("../../src/services/auth.service");


describe("Auth Service", () => {
  afterEach(() => sinon.restore());

  it("should send a mail when forgotPassword is called", async () => {
    sinon.stub(userModel, "findUserByEmail").resolves({ id: "u1", email: "a@b.com" });
    sinon.stub(crypto, "randomBytes").returns(Buffer.from("a".repeat(32)));
    sinon.stub(userModel, "updateUserById").resolves(true);
    const emailService = require("../../src/services/email.service");
    sinon.stub(emailService, "sendMail").resolves({ messageId: "x" });
  
    const res = await authService.forgotPassword({ email: "a@b.com" });
    expect(res).to.have.property("message");
    sinon.assert.calledOnce(emailService.sendMail);
  });

  it("POST /auth/register -> registers user", async () => {
    sinon.stub(userModel, "findUserByEmail").resolves(null);
    sinon.stub(bcrypt, "hash").resolves("hashed");
    sinon.stub(userModel, "createUser").resolves({ id: "u1", name: "A", email: "a@b.com", createdAt: new Date(), updatedAt: new Date() });
    sinon.stub(jwt, "sign").returns("token");

    const res = await authService.register({ name: "A", email: "a@b.com", password: "123456" });
    expect(res).to.have.property("token", "token");
    expect(res.user).to.include({ id: "u1", email: "a@b.com" });
  });

  it("POST /auth/login -> logs in user", async () => {
    sinon.stub(userModel, "findUserByEmail").resolves({ id: "u1", name: "A", email: "a@b.com", passwordHash: "hashed", createdAt: new Date(), updatedAt: new Date() });
    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(jwt, "sign").returns("token");

    const res = await authService.login({ email: "a@b.com", password: "123456" });
    expect(res).to.have.property("token", "token");
  });

  it("POST /auth/logout -> logs out (stateless)", async () => {
    const res = await authService.logout({ userId: "u1" });
    expect(res).to.deep.equal({ success: true });
  });

  it("POST /auth/forgot-password -> issues reset token (dev test asserts email sent)", async () => {
    sinon.stub(userModel, "findUserByEmail").resolves({ id: "u1", email: "a@b.com" });
    sinon.stub(crypto, "randomBytes").returns(Buffer.from("a".repeat(32)));
    sinon.stub(userModel, "updateUserById").resolves(true);
    const emailService = require("../../src/services/email.service");
    sinon.stub(emailService, "sendMail").resolves({ messageId: "x" });
  
    const res = await authService.forgotPassword({ email: "a@b.com" });
    expect(res).to.have.property("message");
    sinon.assert.calledOnce(emailService.sendMail);
  });

  it("POST /auth/reset-password -> resets password", async () => {
    // compute expected hash for token "t"
    const token = "t";
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    sinon.stub(userModel, "findUserByResetTokenHash").resolves({ id: "u1", resetTokenHash: tokenHash });
    sinon.stub(bcrypt, "hash").resolves("newHashed");
    sinon.stub(userModel, "updateUserById").resolves(true);

    const res = await authService.resetPassword({ token, newPassword: "123456" });
    expect(res).to.have.property("message");
  });
});
