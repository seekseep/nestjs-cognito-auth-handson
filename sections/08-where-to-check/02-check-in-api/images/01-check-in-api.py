"""08-02「API で確かめる」の図。

bob が DELETE するたびに、API は team_members を引く。所属は scripts/team-member.js で変え、
変えたら、次のリクエストからすぐ効く。
スキーマ: SOURCE-PATH-GOAL + LINK（表を書き換える）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 380)

bob = c.node(110, 120, "bob", emoji_cp="1f468")  # 👨
api = c.node(450, 120, "API\nNotesService", shape="square", color="blue",
             w=240, h=96, label_scale="label")
db = c.node(450, 300, "team_members", shape="cylinder", color="teal",
            w=240, h=90, label_scale="label")
script = c.node(810, 300, "team-member.js\nadd・remove", shape="square",
                color="gray", w=260, h=90, label_scale="label")

c.link(bob, api, label="DELETE（毎回）")
c.link(api, db, label="所属を引く", label_pos="left")
c.link(script, db, label="書き換える")

c.save("01-check-in-api.svg")
