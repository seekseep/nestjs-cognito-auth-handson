"""06-04「所属で認可する」の図。

bob がトークンを付けて DELETE すると、API はノートの teamId（team-a）と、
SQLite の team_members の表を照らし合わせ、bob が team-a に入っていれば消せる。
スキーマ: SOURCE-PATH-GOAL + LINK（表を引く）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 360)

bob = c.node(100, 120, "bob", emoji_cp="1f468")  # 👨
api = c.node(440, 120, "API\nteamId = team-a", shape="square",
             color="blue", w=240, h=96, label_scale="label")
db = c.node(440, 290, "team_members\nteam-a・bob", shape="cylinder",
            color="teal", w=240, h=96, label_scale="label")
ok = c.node(820, 120, "204", shape="square", color="green", w=120, h=60,
            label_scale="label")

c.link(bob, api, label="DELETE")
c.link(api, db, label="所属を引く", label_pos="left")
c.link(api, ok, label="入っている")

c.save("01-membership.svg")
