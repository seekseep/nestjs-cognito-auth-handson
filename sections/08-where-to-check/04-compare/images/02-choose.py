"""08-04「比べる」の選び方のフローチャート。

上から順に問いをたどる。
1. 所属を変えたら、すぐに効かないと困るか → はい: API で確かめる
2. 所属が多く、トークンが大きくなりすぎるか → はい: API で確かめる
3. DB への問い合わせを減らしたいか、API のほかにもトークンを受け取るサービスがあるか
   → はい: トークンに持たせる / いいえ: API で確かめる
スキーマ: PATH（上から下）+ 分かれ道（はい・いいえ）。
"""

import os
import sys

sys.path.insert(0, os.path.expanduser("~/.claude/skills/genfig"))
from genfig import Canvas  # noqa: E402

c = Canvas(960, 700)

q1 = c.node(300, 90, "所属を変えたら、\nすぐに効かないと困るか", shape="square",
            color="yellow", w=360, h=96, label_scale="label")
q2 = c.node(300, 290, "所属が多く、トークンが\n大きくなりすぎるか", shape="square",
            color="yellow", w=360, h=96, label_scale="label")
q3 = c.node(300, 490, "DB への問い合わせを減らしたいか、\nほかのサービスもトークンを使うか",
            shape="square", color="yellow", w=460, h=96, label_scale="label")
r1 = c.node(780, 90, "API で確かめる", shape="square", color="blue", w=230, h=64,
            label_scale="label")
r2 = c.node(780, 290, "API で確かめる", shape="square", color="blue", w=230, h=64,
            label_scale="label")
r3 = c.node(780, 490, "トークンに持たせる", shape="square", color="purple", w=230,
            h=64, label_scale="label")
r4 = c.node(300, 650, "API で確かめる", shape="square", color="blue", w=230, h=64,
            label_scale="label")

c.link(q1, r1, label="はい")
c.link(q1, q2, label="いいえ", label_pos="left")
c.link(q2, r2, label="はい")
c.link(q2, q3, label="いいえ", label_pos="left")
c.link(q3, r3, label="はい")
c.link(q3, r4, label="いいえ", label_pos="left")

c.save("02-choose.svg")
