"""05-01「サインアップ画面を作る」の図。

サインアップ画面が Cognito に SignUp を送ると、Cognito が確認コードをメールで送る。
Floci はメールを /_aws/ses にためておくので、そこで確認コードを読み、ConfirmSignUp で送る。
スキーマ: SOURCE-PATH-GOAL（1→2→3 の順）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 440)

page = c.node(150, 130, "サインアップ画面", emoji_cp="1f464")  # 👤
cognito = c.node(640, 130, "Cognito（Floci）\nユーザープール", shape="square",
                 color="orange", w=240, h=96, label_scale="label")
mail = c.node(640, 340, "メール（/_aws/ses）", emoji_cp="1f4ec")  # 📬

c.link(page, cognito, label="1. SignUp", offset=26)
c.link(page, cognito, label="3. ConfirmSignUp", offset=-26)
c.link(cognito, mail, label="2. 確認コード", label_pos="right")

c.save("01-sign-up.svg")
