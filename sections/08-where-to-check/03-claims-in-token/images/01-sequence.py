"""08-03「トークンに持たせる」のシーケンス図。

ログインのとき、Cognito（Floci）は Pre Token Generation の Lambda を呼び、
Lambda は API の GET /teams で所属を聞いて、アクセストークンの teams クレームに載せる。
bob は teams 入りのアクセストークンを持ち、DELETE のときにそのトークンを付けて API を呼ぶ。
API はトークンの teams だけを見て、team_members は引かない。
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(next(p / ".claude/skills/genfig" for p in Path(__file__).resolve().parents
                            if (p / ".claude/skills/genfig").is_dir())))
from genfig import Canvas  # noqa: E402
from genfig.tokens import LINE_SUB, PALETTE  # noqa: E402

c = Canvas(960, 800)

# 登場するもの（左から）と、その縦の線（ライフライン）
X = {"bob": 100, "cognito": 345, "lambda": 590, "api": 835}
HEADS = [("bob", "bob\n画面", "gray"), ("cognito", "Cognito\nFloci", "orange"),
         ("lambda", "Lambda\npre-token", "purple"), ("api", "API\nNestJS", "blue")]
TOP, BOTTOM = 92, 780
for key, label, color in HEADS:
    c.raw(f'<line x1="{X[key]}" y1="{TOP}" x2="{X[key]}" y2="{BOTTOM}" '
          f'stroke="{LINE_SUB}" stroke-width="2" stroke-dasharray="6 6"/>')
for key, label, color in HEADS:
    c.node(X[key], 52, label, shape="square", color=color, w=170, h=80, label_scale="label")


def phase(y, title):
    """場面の区切り（左に見出し、横に薄い線）。"""
    c.raw(f'<line x1="20" y1="{y}" x2="940" y2="{y}" stroke="{LINE_SUB}" stroke-width="1"/>')
    c.raw(f'<rect x="20" y="{y + 6}" width="150" height="28" fill="#ffffff"/>')
    c.text(24, y + 26, title, scale="label", align="left", fill=PALETTE["gray"]["text"])


def call(a, b, y, label):
    """呼び出し（濃い実線）。"""
    c.link((X[a], y), (X[b], y), label=label, label_pos="above", clip="none",
           label_scale="body")


def reply(a, b, y, label):
    """返事（薄い点線）。"""
    c.link((X[a], y), (X[b], y), label=label, label_pos="above", clip="none",
           label_scale="body", primary=False, dash="dashed")


# ログインのとき
phase(118, "ログインのとき")
call("bob", "cognito", 186, "ログイン")
call("cognito", "lambda", 246, "トークンを作る前に呼ぶ")
call("lambda", "api", 306, "GET /teams（sub）")
reply("api", "lambda", 366, '["team-a"]')
reply("lambda", "cognito", 426, "teams クレームを足す")
reply("cognito", "bob", 486, "アクセストークン")

# bob が持つアクセストークン（中身を明示する）
c.sticky(20, 506, 300, 92, color="yellow")
c.text(170, 540, "bob のアクセストークン", scale="label", fill=PALETTE["yellow"]["text"])
c.text(170, 576, 'teams: ["team-a"]', scale="label", fill=PALETTE["yellow"]["text"])

# ノートを消すとき
phase(622, "ノートを消すとき")
call("bob", "api", 690, "DELETE + アクセストークン")
c.sticky(700, 704, 256, 46, color="blue")
c.text(828, 734, "トークンの teams を見る", scale="body", fill=PALETTE["blue"]["text"])
reply("api", "bob", 770, "204 No Content")

c.save(os.path.splitext(os.path.basename(__file__))[0] + ".svg")
