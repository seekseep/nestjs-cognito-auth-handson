"""03-01「ノートの API を設計する」の図。

画面と curl が API を呼び、API はノートを SQLite（ボリュームのファイル）に読み書きする。
スキーマ: SOURCE-PATH-GOAL（呼ぶ → 読み書き）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 300)

client = c.node(110, 150, "画面・curl", emoji_cp="1f310")  # 🌐
api = c.node(430, 150, "API\n/notes", shape="square",
             color="blue", w=220, h=96, label_scale="label")
db = c.node(780, 150, "SQLite\nnotes", shape="cylinder",
            color="green", w=170, h=110, label_scale="label")

c.link(client, api, label="HTTP", offset=0)
c.link(api, db, label="読み書き", offset=0)

c.save("01-notes-api.svg")
