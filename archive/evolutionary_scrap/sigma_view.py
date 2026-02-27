```py
#!/usr/bin/env python3
import argparse
from pathlib import Path
import re


def repo_root() -> Path:
    cur = Path.cwd()
    for parent in [cur] + list(cur.parents):
        if (parent / ".git").exists():
            return parent
    return cur


def read_frontmatter(text: str) -> str:
    parts = text.split("

🌊

# Σ-PoI: 7d2f7aeb67dd0e7624179ec0159a10ae91332c5744962c4fc79cd4acc92c5ef1
