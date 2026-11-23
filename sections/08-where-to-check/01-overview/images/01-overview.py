"""08-01「2 つの方法の概要」の図。

上: API で確かめる。リクエストのたびに API が team_members を引く。
下: トークンに持たせる。ログインのときに Lambda が所属を調べてアクセストークンに載せ、API はトークンだけで決める。
スキーマ: 2 段の SOURCE-PATH-GOAL を並べる。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 660)

c.text(40, 56, "API で確かめる", scale="heading", align="left")
b1 = c.node(110, 150, "bob", emoji_cp="1f468")  # 👨
api1 = c.node(470, 150, "API\nDELETE のたびに", shape="square", color="blue",
              w=240, h=90, label_scale="label")
db1 = c.node(810, 150, "team_members", shape="cylinder", color="teal",
             w=220, h=90, label_scale="label")
c.link(b1, api1, label="DELETE")
c.link(api1, db1, label="所属を引く")

c.text(40, 300, "トークンに持たせる", scale="heading", align="left")
b2 = c.node(110, 470, "bob", emoji_cp="1f468")  # 👨
cognito = c.node(500, 360, "Cognito と Lambda\nログインのときに", shape="square",
                 color="orange", w=260, h=90, label_scale="label")
db2 = c.node(830, 360, "team_members", shape="cylinder", color="teal",
             w=220, h=90, label_scale="label")
api2 = c.node(600, 600, "API\nトークンだけで決める", shape="square", color="blue",
              w=240, h=90, label_scale="label")
c.link(b2, cognito, label="1. ログイン")
c.link(cognito, db2, label="所属を引く")
c.link(b2, api2, label="2. トークンを付けて呼ぶ")

c.save("01-overview.svg")
