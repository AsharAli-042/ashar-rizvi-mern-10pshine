const { expect } = require("chai");
const sinon = require("sinon");

const noteModel = require("../../src/models/note.model");
const ApiError = require("../../src/utils/ApiError");
const notesService = require("../../src/services/notes.service");

describe("Notes Service", () => {
  afterEach(() => sinon.restore());

  it("GET /notes -> lists notes for user", async () => {
    sinon.stub(noteModel, "listNotesByUser").resolves([{ id: "n1" }]);
    const res = await notesService.listNotes("u1");
    expect(res).to.deep.equal([{ id: "n1" }]);
  });

  it("POST /notes -> creates a note", async () => {
    sinon.stub(noteModel, "createNote").resolves({ id: "n1", userId: "u1", content: "<p>x</p>" });
    const res = await notesService.createNote("u1", { content: "<p>x</p>" });
    expect(res).to.include({ id: "n1", userId: "u1" });
  });

  it("GET /notes/:id -> gets a single note", async () => {
    sinon.stub(noteModel, "findNoteByIdForUser").resolves({ id: "n1", userId: "u1" });
    const res = await notesService.getNote("u1", "n1");
    expect(res).to.include({ id: "n1" });
  });

  it("PATCH /notes/:id -> updates a note", async () => {
    sinon.stub(noteModel, "updateNoteByIdForUser").resolves({ count: 1 });
    sinon.stub(noteModel, "findNoteByIdForUser").resolves({ id: "n1", userId: "u1", title: "New" });

    const res = await notesService.updateNote("u1", "n1", { title: "New" });
    expect(res).to.include({ id: "n1", title: "New" });
  });

  it("DELETE /notes/:id -> deletes a note", async () => {
    sinon.stub(noteModel, "deleteNoteByIdForUser").resolves({ count: 1 });
    const res = await notesService.deleteNote("u1", "n1");
    expect(res).to.deep.equal({ success: true });
  });

  it("pinNote -> sets pin state and returns updated note", async () => {
    const sampleUpdated = { id: "n1", userId: "u1", isPinned: true, title: "Pinned", content: "x" };

    // stub the model functions used by service
    sinon.stub(noteModel, "setPinForNoteByUser").resolves(sampleUpdated);

    const res = await notesService.pinNote("u1", "n1", true);
    expect(res).to.deep.equal(sampleUpdated);
    expect(noteModel.setPinForNoteByUser.calledOnceWithExactly("n1", "u1", true)).to.be.true;
  });

  it("pinNote -> 404 if note doesn't exist", async () => {
    sinon.stub(noteModel, "setPinForNoteByUser").resolves(null);
    try {
      await notesService.pinNote("u1", "no-such", true);
      throw new Error("Expected throw");
    } catch (err) {
      expect(err.name).to.equal("ApiError");
      expect(err.statusCode).to.equal(404);
    }
  });

  it("searchFavorites -> returns matching favorite notes", async () => {
    const matches = [
      { id: "n1", title: "Hello world", content: "<p>abc</p>", isFavorite: true },
      { id: "n2", title: "Another", content: "search term inside", isFavorite: true },
    ];
    sinon.stub(noteModel, "searchFavoriteNotesByUser").resolves(matches);

    const res = await notesService.searchFavorites("u1", "search term");
    expect(res).to.deep.equal(matches);
    expect(noteModel.searchFavoriteNotesByUser.calledOnceWithExactly("u1", "search term")).to.be.true;
  });

  it("searchFavorites -> returns favorites list when query empty", async () => {
    const matches = [{ id: "n3", title: "Fav", content: "x", isFavorite: true }];
    sinon.stub(noteModel, "searchFavoriteNotesByUser").resolves(matches);

    const res = await notesService.searchFavorites("u1", "");
    expect(res).to.deep.equal(matches);
    expect(noteModel.searchFavoriteNotesByUser.calledOnceWithExactly("u1", "")).to.be.true;
  });
});
