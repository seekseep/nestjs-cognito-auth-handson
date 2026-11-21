"""05-03「トークンが無いと作れないようにする」の図。

API は Authorization ヘッダーのアクセストークンを、Floci が公開している鍵（JWKS）で確かめる。
トークンが無い・正しくなければ 401、正しければノートを作る。
スキーマ: SOURCE-PATH-GOAL + BLOCKAGE（401）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 400)

curl = c.node(110, 150, "curl", emoji_cp="1f511")  # 🔑
api = c.node(480, 150, "API\nverifyToken()", shape="square",
             color="blue", w=240, h=96, label_scale="label")
floci = c.node(840, 150, "Floci\n公開鍵（JWKS）", shape="square",
               color="orange", w=200, h=96, label_scale="label")
ng = c.node(360, 320, "401", shape="square", color="red", w=140, h=60,
            label_scale="label")
ok = c.node(600, 320, "201", shape="square", color="green", w=140, h=60,
            label_scale="label")

c.link(curl, api, label="POST /notes")
c.link(api, floci, label="鍵を取る")
c.link(api, ng, label="無い・正しくない", label_pos="left")
c.link(api, ok, label="正しい", label_pos="right")

c.save("01-require-token.svg")
