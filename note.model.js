const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    ownerName: { type: String },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" }, // HTML from the rich-text editor
    visibility: { type: String, enum: ["public", "private"], default: "private" },
    tags: [{ type: String }],
    pinned: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = { noteModel: mongoose.model("note", noteSchema) };
