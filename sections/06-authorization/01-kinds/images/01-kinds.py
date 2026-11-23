"""06-01「認可の種類」の図。

所有（Ownership）: 作った人だけが消せる。
役割（RBAC）: admin のグループの人は、だれのノートでも消せる。
所属（ReBAC）: ノートのチームに入っている人が消せる。
スキーマ: 3 段の SOURCE-PATH-GOAL（人 → 決め手 → ノート）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 560)

rows = [
    (110, "所有（Ownership）", ("alice", "1f469"), "作った人", "ノート\nownerId = alice"),
    (290, "役割（RBAC）", ("admin", "1f9d1"), "グループ admin", "どのノートも"),
    (470, "所属（ReBAC）", ("bob", "1f468"), "チーム team-a", "ノート\nteamId = team-a"),
]
for y, title, (name, emoji), key, target in rows:
    c.text(40, y - 62, title, scale="heading", align="left")
    person = c.node(130, y, name, emoji_cp=emoji)
    middle = c.node(480, y, key, shape="square", color="blue", w=220, h=64,
                    label_scale="label")
    note = c.node(800, y, target, shape="square", color="yellow", w=230, h=84,
                  label_scale="label")
    c.link(person, middle)
    c.link(middle, note, label="消せる")

c.save("01-kinds.svg")
