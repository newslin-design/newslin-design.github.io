"""
Template loader for the vocab-video pipeline.

Replaces the in-line `voiceTemplates`, `fadeAccu`, and `textTemplate` dicts
that previously lived inside `video_cut.py`. Reads them from `template.json`
so they can be edited (by hand, by Claude Code, or by the web editor) without
touching Python source.

Usage in video_cut.py:

    from templates import load_templates
    voiceTemplates, fadeAccu, textTemplate = load_templates()

The ease function strings ("easeOut") are resolved to actual callables here,
so downstream code keeps working unchanged.
"""

import json
import os
from copy import deepcopy


# ---- ease functions (kept here so JSON only needs the name) ----------------

def easeIn(t):
    return t * t

def easeOut(t):
    return 1 - (1 - t) ** 2

def easeLinear(t):
    return t

EASE_FUNCS = {
    "easeIn": easeIn,
    "easeOut": easeOut,
    "linear": easeLinear,
}


def _resolve_ease(fade_groups):
    """Convert {"ease": "easeOut"} → {"f": easeOut} to match the legacy shape
    expected by video_cut.py (`fade[j]['f']`)."""
    out = {}
    for name, rows in fade_groups.items():
        resolved = []
        for row in rows:
            r = {"t": list(row["t"])}
            ease_name = row.get("ease", "easeOut")
            if ease_name not in EASE_FUNCS:
                raise ValueError(f"Unknown ease '{ease_name}' in fadeAccu[{name}]")
            r["f"] = EASE_FUNCS[ease_name]
            resolved.append(r)
        out[name] = resolved
    return out


def _coerce_tuples(text_templates):
    """Legacy code does tuple unpacking like `xStart, xEnd = textParam['x']`.
    JSON gives lists; both unpack the same way, so this is mostly cosmetic —
    kept as a deepcopy so callers can mutate freely without poisoning the
    on-disk template."""
    return deepcopy(text_templates)


def load_templates(path=None):
    """Load template.json next to this file (or at `path`).

    Returns: (voiceTemplates, fadeAccu, textTemplate)
    in the same shape video_cut.py expects.
    """
    if path is None:
        path = os.path.join(os.path.dirname(__file__), "template.json")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    voiceTemplates = data["voiceTemplates"]
    fadeAccu = _resolve_ease(data["fadeAccu"])
    textTemplate = _coerce_tuples(data["textTemplate"])

    return voiceTemplates, fadeAccu, textTemplate


if __name__ == "__main__":
    v, f, t = load_templates()
    print("voiceTemplates:", list(v.keys()))
    print("fadeAccu:", {k: len(rows) for k, rows in f.items()})
    print("textTemplate:", {k: len(layers) for k, layers in t.items()})
