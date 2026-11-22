import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, List, ListOrdered, ListChecks,
  Quote, Code, SquareCode, Link2, Table2, Undo2, Redo2, Minus, Type, ChevronDown,
} from "lucide-react";

const COLORS = ["#10231f", "#0f766e", "#f2674a", "#d97706", "#2563eb", "#9333ea", "#dc2626"];
const MARKS = ["#fde68a", "#a7f3d0", "#fecaca", "#bfdbfe", "#e9d5ff"];

function Pop({ icon, label, active, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="tb-pop" ref={ref}>
      <button type="button" className={"tb-btn" + (active ? " on" : "")} title={label} aria-label={label}
        onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(!open)}>
        {icon}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="tb-menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function Btn({ onClick, active, label, children, disabled }) {
  return (
    <button type="button" className={"tb-btn" + (active ? " on" : "")} title={label} aria-label={label}
      disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {children}
    </button>
  );
}

function Toolbar({ editor }) {
  if (!editor) return null;
  const c = () => editor.chain().focus();
  const setLink = () => {
    const prev = editor.getAttributes("link").href || "https://";
    const url = window.prompt("Link URL (leave empty to remove)", prev);
    if (url === null) return;
    if (url === "" || url === "https://") return c().unsetLink().run();
    c().extendMarkRange("link").setLink({ href: url }).run();
  };
  const heading = editor.isActive("heading", { level: 1 }) ? "H1"
    : editor.isActive("heading", { level: 2 }) ? "H2"
    : editor.isActive("heading", { level: 3 }) ? "H3" : "Text";

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatting">
      <Btn label="Undo" onClick={() => c().undo().run()} disabled={!editor.can().undo()}><Undo2 size={16} /></Btn>
      <Btn label="Redo" onClick={() => c().redo().run()} disabled={!editor.can().redo()}><Redo2 size={16} /></Btn>
      <span className="tb-sep" />

      <Pop label="Headings" icon={<span className="tb-text">{heading}</span>} active={heading !== "Text"}>
        <button type="button" onClick={() => c().setParagraph().run()}><Type size={15} /> Paragraph</button>
        <button type="button" onClick={() => c().toggleHeading({ level: 1 }).run()}><b>H1</b> Heading 1</button>
        <button type="button" onClick={() => c().toggleHeading({ level: 2 }).run()}><b>H2</b> Heading 2</button>
        <button type="button" onClick={() => c().toggleHeading({ level: 3 }).run()}><b>H3</b> Heading 3</button>
      </Pop>
      <span className="tb-sep" />

      <Btn label="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}><Bold size={16} /></Btn>
      <Btn label="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><Italic size={16} /></Btn>
      <Btn label="Underline" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}><UnderlineIcon size={16} /></Btn>
      <Btn label="Strikethrough" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()}><Strikethrough size={16} /></Btn>

      <Pop label="Highlight" icon={<Highlighter size={16} />} active={editor.isActive("highlight")}>
        <div className="swatches">
          {MARKS.map((m) => (
            <button key={m} type="button" className="swatch" style={{ background: m }} aria-label={`Highlight ${m}`}
              onClick={() => c().toggleHighlight({ color: m }).run()} />
          ))}
          <button type="button" className="swatch none" onClick={() => c().unsetHighlight().run()}>×</button>
        </div>
      </Pop>
      <Pop label="Text colour" icon={<span className="tb-dot" style={{ background: editor.getAttributes("textStyle").color || "var(--ink)" }} />}>
        <div className="swatches">
          {COLORS.map((m) => (
            <button key={m} type="button" className="swatch" style={{ background: m }} aria-label={`Colour ${m}`}
              onClick={() => c().setColor(m).run()} />
          ))}
          <button type="button" className="swatch none" onClick={() => c().unsetColor().run()}>×</button>
        </div>
      </Pop>
      <span className="tb-sep" />

      <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}><List size={16} /></Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
      <Btn label="Checklist" active={editor.isActive("taskList")} onClick={() => c().toggleTaskList().run()}><ListChecks size={16} /></Btn>
      <span className="tb-sep" />

      <Pop label="Table" icon={<Table2 size={16} />} active={editor.isActive("table")}>
        <button type="button" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Insert 3×3 table</button>
        <button type="button" disabled={!editor.can().addRowAfter()} onClick={() => c().addRowAfter().run()}>Add row</button>
        <button type="button" disabled={!editor.can().addColumnAfter()} onClick={() => c().addColumnAfter().run()}>Add column</button>
        <button type="button" disabled={!editor.can().deleteRow()} onClick={() => c().deleteRow().run()}>Delete row</button>
        <button type="button" disabled={!editor.can().deleteColumn()} onClick={() => c().deleteColumn().run()}>Delete column</button>
        <button type="button" disabled={!editor.can().deleteTable()} onClick={() => c().deleteTable().run()}>Delete table</button>
      </Pop>
      <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}><Quote size={16} /></Btn>
      <Btn label="Link" active={editor.isActive("link")} onClick={setLink}><Link2 size={16} /></Btn>
      <Btn label="Inline code" active={editor.isActive("code")} onClick={() => c().toggleCode().run()}><Code size={16} /></Btn>
      <Btn label="Code block" active={editor.isActive("codeBlock")} onClick={() => c().toggleCodeBlock().run()}><SquareCode size={16} /></Btn>
      <Btn label="Divider" onClick={() => c().setHorizontalRule().run()}><Minus size={16} /></Btn>
    </div>
  );
}

export default function RichEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Start writing… use the toolbar for headings, lists, tables and more." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // load content when switching to an existing note
  const first = useRef(true);
  useEffect(() => {
    if (editor && first.current && value) {
      editor.commands.setContent(value, false);
      first.current = false;
    }
  }, [editor, value]);

  return (
    <div className="editor">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="prose" />
    </div>
  );
}
