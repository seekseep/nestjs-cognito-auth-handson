"""03-03「認可を設計する」の図。

alice が作ったノートには ownerId = alice が入る。bob のトークンで消そうとすると 403、
alice のトークンなら 204 になる。
スキーマ: CONTAINER（ノート）+ BLOCKAGE（403）+ SOURCE-PATH-GOAL（204）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(900, 360)

alice = c.node(110, 100, "alice", emoji_cp="1f469")  # 👩
bob = c.node(110, 270, "bob", emoji_cp="1f468")  # 👨
note = c.node(470, 185, "ノート\nownerId = alice", shape="square",
              color="yellow", w=230, h=96, label_scale="label")
ok = c.node(790, 100, "204（消せる）", shape="square", color="green", w=180, h=60,
            label_scale="label")
ng = c.node(790, 270, "403（消せない）", shape="square", color="red", w=180, h=60,
            label_scale="label")

c.link(alice, note, label="DELETE")
c.link(bob, note, label="DELETE")
c.link(note, ok, label="作った人")
c.link(note, ng, label="ほかの人")

c.save("01-authorization.svg")
