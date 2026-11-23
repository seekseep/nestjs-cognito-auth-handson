// チームの所属を足す・外す。API のコンテナの中で動かす（podman compose exec api node scripts/team-member.js ...）。
//   node scripts/team-member.js add bob@example.com team-a
//   node scripts/team-member.js remove bob@example.com team-a
import { DatabaseSync } from 'node:sqlite';

const [action, email, teamId] = process.argv.slice(2);

// メールアドレスから、ユーザーの ID（sub）を Cognito（Floci）に聞く
const response = await fetch('http://floci:4566', {
  method: 'POST',
  headers: {
    'content-type': 'application/x-amz-json-1.1',
    'x-amz-target': 'AWSCognitoIdentityProviderService.AdminGetUser',
  },
  body: JSON.stringify({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: email }),
});
const user = await response.json();
if (!response.ok) throw new Error(`AdminGetUser: ${user.__type} ${user.message}`);
const sub = user.UserAttributes.find((attribute) => attribute.Name === 'sub').Value;

const db = new DatabaseSync(process.env.DB_PATH);
if (action === 'add') {
  db.prepare('INSERT OR IGNORE INTO teams (id) VALUES (?)').run(teamId);
  db.prepare('INSERT OR IGNORE INTO team_members (teamId, userId) VALUES (?, ?)').run(teamId, sub);
} else if (action === 'remove') {
  db.prepare('DELETE FROM team_members WHERE teamId = ? AND userId = ?').run(teamId, sub);
}
console.log(db.prepare('SELECT teamId, userId FROM team_members').all());
