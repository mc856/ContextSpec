import { parseDocument, YAMLMap, YAMLSeq } from 'yaml';

type Doc = ReturnType<typeof parseDocument>;

/**
 * Force block style on a newly created node tree. Nodes created via
 * `doc.createNode` default to flow style when the surrounding collection
 * is flow (e.g. the skeleton's `initiatives: {}`), which renders git-noisy
 * one-liners. See memory/anti-patterns.md: "Empty flow-style YAML mappings
 * spread to children".
 *
 * NOTE: depends on the `yaml` package's AST surface (`YAMLMap` / `YAMLSeq`
 * classes and their `.flow` field). Pinning or bumping the `yaml` major
 * version must re-verify this module.
 */
export function forceBlockStyle(node: unknown): void {
  if (node instanceof YAMLMap || node instanceof YAMLSeq) {
    // Empty collections stay flow so they render inline (`[]` / `{}`),
    // matching the skeleton template's `includes: []`.
    node.flow = node.items.length === 0;
    for (const it of node.items) {
      if (node instanceof YAMLMap) {
        forceBlockStyle((it as { value?: unknown }).value);
      } else {
        forceBlockStyle(it);
      }
    }
  }
}

/** Get the top-level mapping at `key`, creating an empty one if absent. */
export function ensureMapping(doc: Doc, key: string): YAMLMap {
  const node = doc.get(key);
  if (node instanceof YAMLMap) return node;
  const empty = new YAMLMap();
  doc.set(key, empty);
  return empty;
}

/** Keys of a top-level mapping, or [] if the mapping is absent/not a map. */
export function mappingKeys(doc: Doc, key: string): string[] {
  const node = doc.get(key);
  if (!(node instanceof YAMLMap)) return [];
  return node.items
    .map((it) => (it.key as { value?: unknown })?.value)
    .filter((k): k is string => typeof k === 'string');
}
