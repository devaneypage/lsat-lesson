import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const stylesheet = readFileSync(join(root, "client/src/index.css"), "utf8");
const document = readFileSync(join(root, "client/index.html"), "utf8");
const primitives = readFileSync(join(root, "client/src/components/PagePrimitives.tsx"), "utf8");

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(tsx?|css|html)$/.test(entry.name) ? [path] : [];
  });
}

describe("Academic Light design-system contract", () => {
  it("defines every required semantic state token", () => {
    for (const token of [
      "--background",
      "--foreground",
      "--primary",
      "--secondary",
      "--accent",
      "--success",
      "--warning",
      "--info",
      "--destructive",
    ]) {
      expect(stylesheet).toContain(`${token}:`);
    }
  });

  it("loads only the selected interface, reading, and notation families", () => {
    expect(document).toContain("family=Space+Grotesk");
    expect(document).toContain("family=Lora");
    expect(document).toContain("family=JetBrains+Mono");

    const clientSource = collectSourceFiles(join(root, "client"))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    expect(clientSource).not.toMatch(/Archivo(?:_Black| Black)?/);
  });

  it("preserves global preference behavior and system reduced motion", () => {
    expect(stylesheet).toContain('html[data-text-scale="large"]');
    expect(stylesheet).toContain('html[data-reading-width="comfortable"]');
    expect(stylesheet).toContain('html[data-contrast="high"]');
    expect(stylesheet).toContain('html[data-motion="reduced"]');
    expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("provides the canonical page and state primitives with an academic artifact surface", () => {
    for (const component of ["PageFrame", "PageHeader", "SectionCard", "MetadataRow", "StatePanel"]) {
      expect(primitives).toContain(`function ${component}`);
    }
    expect(stylesheet).toContain(".academic-surface");
    expect(primitives).toContain("academic-surface");
  });
});
