const { expect } = require("chai");
const sinon = require("sinon");

const userModel = require("../../src/models/user.model");
const usersService = require("../../src/services/users.service");

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
});
