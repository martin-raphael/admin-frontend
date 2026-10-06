import React from "react";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

/**
 * Parse a plain-text description into blocks:
 *   - Paragraphs separated by blank lines
 *   - Lists where consecutive lines start with "-" or "*"
 *   - **inline bold** within any block
 */
function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      list.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Convert **bold** markers into <strong> React nodes. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
}

export function renderDescription(raw: string | null): React.ReactNode {
  if (!raw || !raw.trim()) return null;

  const blocks = parseBlocks(raw);

  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-ink-700">
      {blocks.map((block, bi) => {
        if (block.type === "paragraph") {
          return <p key={`p-${bi}`}>{renderInline(block.text, `p-${bi}`)}</p>;
        }

        return (
          <ul key={`ul-${bi}`} className="space-y-2.5 pl-0">
            {block.items.map((item, ii) => (
              <li key={`li-${bi}-${ii}`} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                />
                <span>{renderInline(item, `li-${bi}-${ii}`)}</span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}