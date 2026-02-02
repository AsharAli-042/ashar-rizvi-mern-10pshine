const { getPrisma } = require("../config/db");

const prisma = () => getPrisma();

function createUser(data) {
  return prisma().user.create({ data });
}

function findUserByEmail(email) {
  return prisma().user.findUnique({ where: { email } });
}

function findUserSafeById(id) {
  return prisma().user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });
}

function updateUserById(id, data) {
  return prisma().user.update({ where: { id }, data });
}

function findUserByResetTokenHash(resetTokenHash) {
  return prisma().user.findFirst({
    where: {
      resetTokenHash,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });
}

/* return full user record including passwordHash */
function findUserByIdWithHash(id) {
  return prisma().user.findUnique({
    where: { id },
  });
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserSafeById,
  updateUserById,
  findUserByResetTokenHash,
  findUserByIdWithHash, 
};
