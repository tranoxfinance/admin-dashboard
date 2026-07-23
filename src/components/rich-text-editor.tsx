"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, Pilcrow } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  editable?: boolean;
}

function ensureBlockStructure(html: string): string {
  if (/<(p|h1|h2|div)[\s>]/i.test(html)) {
    return html;
  }
  let blocks = html
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length <= 1 && /\r?\n/.test(html)) {
    blocks = html
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (blocks.length === 0) {
    return "";
  }
  return blocks.map((block) => `<p>${block}</p>`).join("");
}

const TOOLBAR_ITEMS = [
  { icon: Bold, label: "Bold", command: "bold" as const },
  { icon: Italic, label: "Italic", command: "italic" as const },
  { icon: Heading1, label: "Heading 1", command: "h1" as const },
  { icon: Heading2, label: "Heading 2", command: "h2" as const },
  { icon: Pilcrow, label: "Paragraph", command: "p" as const },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 260,
  editable = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !editorRef.current) {
      return;
    }
    editorRef.current.innerHTML = ensureBlockStructure(value);
    initialized.current = true;
  }, [value]);

  function exec(command: (typeof TOOLBAR_ITEMS)[number]["command"]) {
    editorRef.current?.focus();
    document.execCommand("defaultParagraphSeparator", false, "p");
    if (command === "bold" || command === "italic") {
      document.execCommand(command);
    } else {
      document.execCommand("formatBlock", false, `<${command}>`);
    }
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-transparent">
      {editable ? (
        <div className="flex items-center gap-1 border-b border-input bg-muted/40 p-1.5">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.command}
              type="button"
              title={item.label}
              aria-label={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => exec(item.command)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="size-3.5" />
            </button>
          ))}
        </div>
      ) : null}
      <div
        ref={editorRef}
        contentEditable={editable}
        role="textbox"
        aria-multiline="true"
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        onFocus={() =>
          document.execCommand("defaultParagraphSeparator", false, "p")
        }
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
        style={{ minHeight }}
        className={cn(
          "prose-editor px-4 py-3 text-[15px] leading-relaxed outline-none",
          "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:first:mt-0",
          "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:first:mt-0",
          "[&_p]:mb-2 [&_p]:last:mb-0",
          "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
