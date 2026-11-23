"""08-03「トークンに持たせる」の図。

ログインのとき、Cognito（Floci）は Pre Token Generation の Lambda を呼ぶ。
Lambda は API の GET /teams で所属を聞き、アクセストークンの teams クレームに載せる。
DELETE のとき、API はトークンの teams だけを見て、team_members は引かない。
スキーマ: SOURCE-PATH-GOAL（ログイン → Lambda → API）と、もう 1 本（DELETE）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 440)

bob = c.node(100, 110, "bob", emoji_cp="1f468")  # 👨
cognito = c.node(400, 110, "Cognito（Floci）", shape="square", color="orange",
                 w=210, h=70, label_scale="label")
lam = c.node(780, 110, "Lambda\npre-token", shape="square", color="purple",
             w=200, h=86, label_scale="label")
teams = c.node(780, 320, "API\nGET /teams", shape="square", color="blue",
               w=200, h=86, label_scale="label")
api = c.node(400, 330, "API\nDELETE /notes/{id}", shape="square", color="blue",
             w=270, h=86, label_scale="label")

c.link(bob, cognito, label="ログイン")
c.link(cognito, lam, label="呼ぶ")
c.link(lam, teams, label="所属を聞く", label_pos="right")
c.link(bob, api, label="teams 付きのトークン")

c.save("01-claims-in-token.svg")
