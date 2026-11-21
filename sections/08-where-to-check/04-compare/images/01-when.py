"""08-04「比べる」の、所属を外したときにいつ効くかの図。

bob を team-a から外したあと、同じトークンで消すと、API で確かめる方法では 403（すぐ効く）、
トークンに持たせる方法では 204（トークンを取り直すまで効かない）。取り直すと 403。
スキーマ: 2 段の時間の流れ（左から右）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 360)

c.text(40, 60, "API で確かめる", scale="heading", align="left")
a1 = c.node(130, 120, "bob を外す", shape="square", color="gray", w=170, h=56,
            label_scale="label")
a2 = c.node(480, 120, "同じトークンで 403", shape="square", color="red", w=240,
            h=56, label_scale="label")
c.link(a1, a2, label="すぐ効く")

c.text(40, 220, "トークンに持たせる", scale="heading", align="left")
b1 = c.node(130, 285, "bob を外す", shape="square", color="gray", w=170, h=56,
            label_scale="label")
b2 = c.node(480, 285, "同じトークンで 204", shape="square", color="green", w=230,
            h=56, label_scale="label")
b3 = c.node(840, 285, "取り直すと 403", shape="square", color="red", w=190,
            h=56, label_scale="label")
c.link(b1, b2, label="まだ効かない")
c.link(b2, b3, label="次のトークン")

c.save("01-when.svg")
