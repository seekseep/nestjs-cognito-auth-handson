"""06-03「役割で認可する」の図。

admin@example.com がログインすると、Cognito はアクセストークンの cognito:groups に admin を入れる。
API はそれを見て、だれのノートでも消せるようにする。
スキーマ: SOURCE-PATH-GOAL（ログイン → トークン → API）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 380)

admin = c.node(110, 110, "admin", emoji_cp="1f9d1")  # 🧑
cognito = c.node(440, 110, "Cognito（Floci）\nグループ admin", shape="square",
                 color="orange", w=250, h=96, label_scale="label")
api = c.node(440, 290, "API\ncognito:groups を見る", shape="square",
             color="blue", w=250, h=96, label_scale="label")
ok = c.node(780, 290, "204", shape="square", color="green", w=120, h=60,
            label_scale="label")

c.link(admin, cognito, label="ログイン")
c.link(cognito, api, label="トークン", label_pos="left")
c.link(api, ok, label="admin")

c.save("01-role.svg")
