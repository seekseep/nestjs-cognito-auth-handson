/** メモ 1 件の形。 */
export interface Note {
  id: string;
  /** 作った人の sub（Cognito のユーザー ID）。 */
  ownerId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}
