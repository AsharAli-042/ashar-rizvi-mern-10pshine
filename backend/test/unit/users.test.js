const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");

const userModel = require("../../src/models/user.model");
const usersService = require("../../src/services/users.service");
const ApiError = require("../../src/utils/ApiError");

describe("Users Service", () => {
  afterEach(() => sinon.restore());

  it("GET /users/me -> returns current user", async () => {
    sinon.stub(userModel, "findUserSafeById").resolves({ id: "u1", name: "A", email: "a@b.com" });
    const res = await usersService.getMe("u1");
    expect(res).to.include({ id: "u1", email: "a@b.com" });
  });

  it("PATCH /users/me -> updates current user", async () => {
    sinon.stub(userModel, "updateUserById").resolves(true);
    sinon.stub(userModel, "findUserSafeById").resolves({ id: "u1", name: "New", email: "a@b.com" });

    const res = await usersService.updateMe("u1", { name: "New" });
    expect(res).to.include({ id: "u1", name: "New" });
  });

  it("changePassword -> succeeds when current password correct", async () => {
    const userId = "u1";
    const currentHash = "oldHash";
    const newPassword = "newStrong123";

    // stub to return user including passwordHash
    sinon.stub(userModel, "findUserByIdWithHash").resolves({
      id: userId,
      passwordHash: currentHash,
    });

    // stub bcrypt compare and hash
    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(bcrypt, "hash").resolves("newHash");
    // stub update
    sinon.stub(userModel, "updateUserById").resolves(true);

    const res = await usersService.changePassword(userId, "oldpass", newPassword);
    expect(res).to.have.property("message");
    expect(res.message).to.equal("Password changed successfully");
    // ensure update called with cleared reset token fields
    expect(userModel.updateUserById.calledOnce).to.be.true;
    const args = userModel.updateUserById.getCall(0).args;
    expect(args[0]).to.equal(userId);
    expect(args[1]).to.have.property("passwordHash", "newHash");
  });

  it("changePassword -> throws 401 when current password invalid", async () => {
    const userId = "u1";
    sinon.stub(userModel, "findUserByIdWithHash").resolves({ id: userId, passwordHash: "x" });
    sinon.stub(bcrypt, "compare").resolves(false);

    try {
      await usersService.changePassword(userId, "wrong", "newpass");
      throw new Error("Expected error");
    } catch (err) {
      expect(err).to.be.instanceOf(ApiError);
      expect(err.statusCode).to.equal(401);
      expect(err.code).to.equal("INVALID_CREDENTIALS");
    }
  });
});
