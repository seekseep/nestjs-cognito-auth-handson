"""03-02「認証を設計する」の図。

ログイン画面が Cognito からアクセストークンを受け取る。API を呼ぶときに Authorization ヘッダーで付け、
API はトークンを確かめて、正しくなければ 401 にする。
スキーマ: SOURCE-PATH-GOAL（ログイン → トークン → API）+ BLOCKAGE（401）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 500)

user = c.node(110, 120, "ログイン画面", emoji_cp="1f464")  # 👤
cognito = c.node(500, 120, "Cognito（Floci）\nユーザープール", shape="square",
                 color="orange", w=240, h=96, label_scale="label")
curl = c.node(110, 340, "curl・画面", emoji_cp="1f511")  # 🔑
api = c.node(500, 340, "API\nトークンを確かめる", shape="square",
             color="blue", w=240, h=96, label_scale="label")
ok = c.node(840, 260, "201・204", shape="square", color="green", w=150, h=60,
            label_scale="label")
ng = c.node(840, 430, "401", shape="square", color="red", w=150, h=60,
            label_scale="label")

c.link(user, cognito, label="ログイン", offset=26)
c.link(cognito, user, label="アクセストークン", offset=26, primary=False)
c.link(curl, api, label="トークンを付ける")
c.link(api, ok, label="正しい", label_pos="above")
c.link(api, ng, label="無い・正しくない", label_pos="below")

c.save("01-authentication.svg")
