import type { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';

/** Guard が検証したアクセストークンの中身。サインインしているユーザーを表す。 */
export type User = CognitoAccessTokenPayload;

/** 全員のメモを扱える Cognito グループの名前。 */
export const ADMIN_GROUP = 'admin';

/** ユーザーが admin グループに入っているか。 */
export function isAdmin(user: User): boolean {
  return user['cognito:groups']?.includes(ADMIN_GROUP) ?? false;
}
