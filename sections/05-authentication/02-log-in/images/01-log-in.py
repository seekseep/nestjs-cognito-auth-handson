"""05-02「ログイン画面を作る」の図。

ログイン画面がメールアドレスとパスワードで InitiateAuth を送ると、Cognito がアクセストークンを返す。
スキーマ: CYCLE（往復）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 280)

page = c.node(130, 140, "ログイン画面", emoji_cp="1f464")  # 👤
cognito = c.node(620, 140, "Cognito（Floci）\nユーザープール", shape="square",
                 color="orange", w=240, h=96, label_scale="label")

c.link(page, cognito, label="InitiateAuth", offset=28)
c.link(cognito, page, label="アクセストークン", offset=28, primary=False)

c.save("01-log-in.svg")
