"""07 章「整理する」の構成図。どの節でも同じ構図で、NotesController から部品が分かれていく。

STAGE だけを節ごとに変える（start / db / service / auth）。
その節で分けたものに色を付け、前の節までに分けたものは灰色にする。
スキーマ: CONTAINER（AppModule・DatabaseModule・NotesController）
+ SPLITTING（取り出す）+ LINK（注入・前に動く）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402
from genfig.tokens import PALETTE  # noqa: E402

STAGE = "start"

ORDER = ["db", "service", "auth"]
ROW_LABELS = {
    "db": "データベースを開く",
    "service": "SQL と処理",
    "auth": "トークンの確認",
}

moved = [] if STAGE == "start" else ORDER[: ORDER.index(STAGE) + 1]
current = None if STAGE == "start" else STAGE


def color_of(key, color):
    return color if key == current else "gray"


c = Canvas(960, 540)

# AppModule（いつも全体を包む）
c.sticky(20, 20, 920, 500, color="gray", dash="dashed", weight="thin")
c.text(44, 56, "AppModule", scale="heading", align="left")

# NotesController（いつも同じ位置・大きさ）
ctrl = c.sticky(68, 128, 300, 352, color="teal", weight="thick")
c.text(90, 160, "NotesController", scale="label", align="left", fill="#0f766e")

rows = ["受け取って返す"] + [ROW_LABELS[k] for k in ORDER if k not in moved]
for i, label in enumerate(rows):
    c.node(218, 210 + i * 52, label, shape="square", color="gray",
           w=264, h=42, label_scale="label")

nodes = {}


def box(cx, cy, label, **kw):
    """2 行のラベルを図形の上下の中央に置く（node() は 1 行目を中央に置くため）。"""
    w, h, color = kw["w"], kw["h"], kw["color"]
    draw = c.hexagon if kw["shape"] == "hexagon" else c.sticky
    n = draw(cx - w / 2, cy - h / 2, w, h, color=color)
    c.text(cx, cy - 4, label, scale="label", fill=PALETTE[kw["color"]]["text"])
    return n


if "db" in moved:
    db_color = color_of("db", "green")
    c.sticky(702, 96, 228, 200, color=db_color, weight="thick")
    c.text(716, 128, "DatabaseModule", scale="label", align="left")
    nodes["db"] = c.node(816, 210, "DatabaseSync", shape="cylinder",
                         color=db_color, w=196, h=116, label_scale="label")
if "service" in moved:
    nodes["service"] = box(540, 210, "NotesService\nSQL と処理", shape="hexagon",
                           color=color_of("service", "purple"), w=250, h=110)
if "auth" in moved:
    nodes["auth"] = box(540, 410, "AuthMiddleware\nトークンの確認", shape="square",
                        color=color_of("auth", "orange"), w=270, h=92)

# 注入（データベース → 使う側、サービス → コントローラー）と、コントローラーの前に動く middleware
if "db" in nodes:
    if "service" in nodes:
        c.link(nodes["db"], nodes["service"], label="注入", start="w", label_pos="above")
    else:
        c.link(nodes["db"], (ctrl.right, 210), label="注入", start="w")
if "service" in nodes:
    c.link(nodes["service"], (ctrl.right, 210), label="注入", start="w", label_pos="above")
if "auth" in nodes:
    c.link(nodes["auth"], (ctrl.right, 410), label="先に動く", start="w", label_pos="above")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
