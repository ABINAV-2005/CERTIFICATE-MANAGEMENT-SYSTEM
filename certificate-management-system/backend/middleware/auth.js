// Deprecated compatibility layer.
// Use authMiddleware.js (`protect`, `authorize`) in new code.
import { protect, authorize, isAdmin } from './authMiddleware.js';

export const auth = protect;
export { authorize, isAdmin };
