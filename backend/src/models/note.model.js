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

/* ----- NEW: search across ALL notes for a user ----- */
function searchNotesByUser(userId, q) {
  if (!q || !q.trim()) {
    return prisma().note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  // NOTE: Prisma v6 doesn't support `mode: "insensitive"`.
  // For most MySQL setups contains will be case-insensitive if DB collation is ci.
  return prisma().note.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });
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
  // No `mode` option (Prisma v6). Use contains; relies on DB collation for case behavior.
  return prisma().note.findMany({
    where: {
      userId,
      isFavorite: true,
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
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
  searchNotesByUser, // exported
};