"""02-02「Podman で動かす」の図。

ブラウザは web（nginx）から画面（public/）を受け取り、画面の JavaScript が api（NestJS）の GET / を呼ぶ。
スキーマ: CONTAINER（Podman の compose）+ SOURCE-PATH-GOAL（2 本の取得）。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 400)

browser = c.node(100, 200, "ブラウザ", emoji_cp="1f310")  # 🌐

c.sticky(250, 40, 630, 320, color="gray", dash="dashed", weight="thin")
c.text(274, 76, "Podman（compose.yaml）", scale="heading", align="left")

web = c.node(560, 140, "web（nginx）\n127.0.0.1:3000", shape="square",
             color="green", w=250, h=90, label_scale="label")
api = c.node(560, 280, "api（NestJS）\n127.0.0.1:3001", shape="square",
             color="blue", w=250, h=90, label_scale="label")

c.link(browser, web, label="画面（public/）", offset=0)
c.link(browser, api, label="GET /", offset=0)

c.save("01-containers.svg")
