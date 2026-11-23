"""README「このハンズオンで作るもの」の図。

ブラウザは web（nginx）から画面を受け取り、サインアップとログインは Cognito（Floci）を直接呼び、
ノートの API（NestJS）にはアクセストークンを付けて呼ぶ。API はトークンを Floci の鍵で確かめ、
ノートを SQLite に読み書きする。どれも Podman のコンテナで動かす。
スキーマ: CONTAINER（Podman）+ SOURCE-PATH-GOAL。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 520)

browser = c.node(100, 270, "ブラウザ", emoji_cp="1f310")  # 🌐

c.sticky(240, 30, 700, 470, color="gray", dash="dashed", weight="thin")
c.text(264, 66, "Podman（compose.yaml）", scale="heading", align="left")

web = c.node(470, 130, "web (nginx)\n画面", shape="square",
             color="green", w=220, h=90, label_scale="label")
floci = c.node(470, 270, "Floci\nCognito", shape="square",
               color="orange", w=220, h=90, label_scale="label")
api = c.node(470, 410, "api (NestJS)\nノートの API", shape="square",
             color="blue", w=220, h=90, label_scale="label")
db = c.node(800, 410, "SQLite\nnotes", shape="cylinder",
            color="teal", w=160, h=100, label_scale="label")

c.link(browser, web, label="画面", route="elbow", first="v", start="n", end="w")
c.link(browser, floci, label="ログイン")
c.link(browser, api, label="トークン付き", route="elbow", first="v", start="s", end="w")
c.link(api, floci, label="鍵", start="n", end="s")
c.link(api, db, label="読み書き")

c.save("01-overall.svg")
