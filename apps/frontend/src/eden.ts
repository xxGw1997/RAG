import { treaty } from "@elysia/eden"
import type { App } from "@rag-project/backend"

export const api = treaty<App>("http://localhost:3000")
