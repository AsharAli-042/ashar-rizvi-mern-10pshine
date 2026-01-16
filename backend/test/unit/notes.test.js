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
});
