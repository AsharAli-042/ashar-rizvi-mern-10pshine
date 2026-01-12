const { getPrisma } = require("../config/db");

const prisma = () => getPrisma();

function listNotesByUser(userId) {
  return prisma().note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

function createNote(data) {
  return prisma().note.create({ data });
}

function findNoteByIdForUser(id, userId) {
  return prisma().note.findFirst({ where: { id, userId } });
}

function updateNoteByIdForUser(id, userId, data) {
  return prisma().note.updateMany({ where: { id, userId }, data });
}

function deleteNoteByIdForUser(id, userId) {
  return prisma().note.deleteMany({ where: { id, userId } });
}

module.exports = {
  listNotesByUser,
  createNote,
  findNoteByIdForUser,
  updateNoteByIdForUser,
  deleteNoteByIdForUser,
};
