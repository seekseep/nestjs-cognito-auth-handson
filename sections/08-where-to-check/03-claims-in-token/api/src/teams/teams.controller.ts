import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';

/**
 * Pre Token Generation の Lambda が呼ぶ、内部向けの入口。
 * トークン無しで所属を返すので、本番では外から届かない場所に置く。
 */
@Controller('teams')
export class TeamsController {
  constructor(private readonly db: DatabaseSync) {}

  // GET /teams?userId=<sub> … そのユーザーが入っているチームの ID の配列
  @Get()
  findByUser(@Query('userId') userId: string): string[] {
    const rows = this.db
      .prepare('SELECT teamId FROM team_members WHERE userId = ? ORDER BY teamId')
      .all(userId) as { teamId: string }[];
    return rows.map((row) => row.teamId);
  }
}
