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

/* set pin state */
async function setPinForNoteByUser(id, userId, isPinned) {
  await prisma().note.updateMany({
    where: { id, userId },
    data: { isPinned },
  });
  // return the updated note (or null)
  return findNoteByIdForUser(id, userId);
}

/* search favorite notes by query */
function searchFavoriteNotesByUser(userId, q) {
  if (!q || !q.trim()) {
    // return all favorites if empty query
    return prisma().note.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Case-insensitive contains search on title and content
  return prisma().note.findMany({
    where: {
      userId,
      isFavorite: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
}

module.exports = {
  listNotesByUser,
  createNote,
  findNoteByIdForUser,
  updateNoteByIdForUser,
  deleteNoteByIdForUser,
  setPinForNoteByUser,           
  searchFavoriteNotesByUser,     
};
