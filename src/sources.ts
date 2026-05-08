import type { SourceDecl } from './registry.js';

export interface SourceLink {
  raw: string;
  sourceId: string;
  relPath: string;
}

const SOURCE_LINK_RE = /source:\/\/([a-zA-Z_][a-zA-Z0-9_]*)\/([^\s)`"]+)/g;

export function scanSourceLinks(text: string): SourceLink[] {
  const out: SourceLink[] = [];
  for (const m of text.matchAll(SOURCE_LINK_RE)) {
    out.push({
      raw: `source://${m[1]}/${m[2]}`,
      sourceId: m[1]!,
      relPath: m[2]!,
    });
  }
  return out;
}

export interface SourceValidation {
  ok: boolean;
  reason?: string;
}

export function validateSourceLink(
  link: SourceLink,
  sources: Record<string, SourceDecl> | undefined,
): SourceValidation {
  const decl = sources?.[link.sourceId];
  if (!decl) {
    return { ok: false, reason: `unknown source id '${link.sourceId}'` };
  }
  if (decl.exclude && matchesAny(link.relPath, decl.exclude)) {
    return { ok: false, reason: `excluded by '${link.sourceId}.exclude'` };
  }
  if (decl.include && !matchesAny(link.relPath, decl.include)) {
    return { ok: false, reason: `not in '${link.sourceId}.include'` };
  }
  return { ok: true };
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((p) => globToRegex(p).test(value));
}

/**
 * Tiny glob -> RegExp.
 * Supports:
 * - `**` matches any number of path segments (including zero).
 * - `*` matches any chars except `/`.
 * - `?` matches one char except `/`.
 * Other regex meta chars are escaped.
 */
export function globToRegex(glob: string): RegExp {
  let r = '^';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!;
    if (c === '*') {
      if (glob[i + 1] === '*') {
        r += '.*';
        i++;
      } else {
        r += '[^/]*';
      }
    } else if (c === '?') {
      r += '[^/]';
    } else if ('.+^$|()[]{}\\'.includes(c)) {
      r += '\\' + c;
    } else {
      r += c;
    }
  }
  r += '$';
  return new RegExp(r);
}
