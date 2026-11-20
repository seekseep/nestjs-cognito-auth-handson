import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** トークン無しで呼べることを表す。アプリ全体に掛けた AuthGuard が、これを見て通す。 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
