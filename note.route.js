const express = require("express");
const { noteModel } = require("../model/note.model");
const { auth, optionalAuth } = require("../middlewere/auth.middlewere");

const noteRouter = express.Router();

const pick = (b = {}) => {
  const out = {};
  for (const k of ["title", "content", "visibility", "tags", "pinned", "dueDate"]) {
    if (b[k] !== undefined) out[k] = b[k];
  }
  if (out.visibility && !["public", "private"].includes(out.visibility)) delete out.visibility;
  return out;
};
const bad = (res, e) => res.status(400).send({ msg: e.message || "Bad request" });

// ---- public (no login) ----
noteRouter.get("/public", async (req, res) => {
  res.send(await noteModel.find({ visibility: "public", deletedAt: null }).sort({ updatedAt: -1 }));
});

// ---- my notes ----
noteRouter.get("/", auth, async (req, res) => {
  res.send(await noteModel.find({ owner: req.userId }).sort({ updatedAt: -1 }));
});

noteRouter.post("/", auth, async (req, res) => {
  try {
    res.status(201).send(await noteModel.create({ ...pick(req.body), owner: req.userId, ownerName: req.userName }));
  } catch (e) {
    bad(res, e);
  }
});

// one note: public -> anyone, private -> owner only
noteRouter.get("/:id", optionalAuth, async (req, res) => {
  try {
    const note = await noteModel.findById(req.params.id);
    if (!note || (note.deletedAt && String(note.owner) !== req.userId)) return res.status(404).send({ msg: "Note not found" });
    if (note.visibility === "private" && String(note.owner) !== req.userId) {
      return res.status(403).send({ msg: "This note is private" });
    }
    res.send(note);
  } catch {
    res.status(404).send({ msg: "Note not found" });
  }
});

noteRouter.post("/:id/view", optionalAuth, async (req, res) => {
  try {
    const note = await noteModel.findOne({ _id: req.params.id, visibility: "public" });
    if (note && String(note.owner) !== req.userId) await noteModel.updateOne({ _id: note._id }, { $inc: { views: 1 } });
  } catch {}
  res.send({ ok: true });
});

noteRouter.put("/:id", auth, async (req, res) => {
  try {
    const note = await noteModel.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, pick(req.body), { new: true, runValidators: true });
    note ? res.send(note) : res.status(404).send({ msg: "Note not found" });
  } catch (e) {
    bad(res, e);
  }
});

// move to trash
noteRouter.delete("/:id", auth, async (req, res) => {
  await noteModel.updateOne({ _id: req.params.id, owner: req.userId }, { deletedAt: new Date() });
  res.send({ msg: "Moved to trash" });
});
noteRouter.patch("/:id/restore", auth, async (req, res) => {
  await noteModel.updateOne({ _id: req.params.id, owner: req.userId }, { deletedAt: null });
  res.send({ msg: "Restored" });
});
noteRouter.delete("/:id/purge", auth, async (req, res) => {
  await noteModel.deleteOne({ _id: req.params.id, owner: req.userId });
  res.send({ msg: "Deleted forever" });
});

module.exports = { noteRouter };
