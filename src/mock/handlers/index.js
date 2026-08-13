// 도메인별로 나눠 둔 3개 핸들러 묶음을 하나의 배열로 합쳐서 내보냄
// src/mock/browser.ts의 `import { handlers } from './handlers'`가 이 파일을 가리킴.

import { authHandlers } from './auth.handlers';
import { postHandlers } from './post.handlers';
import { relationHandlers } from './relation.handlers';

export const handlers = [...authHandlers, ...postHandlers, ...relationHandlers];
