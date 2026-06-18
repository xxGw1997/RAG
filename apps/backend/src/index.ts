import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { knowledgeBase } from "@/modules/knowledge-base"

const app = new Elysia()
  .use(cors())
  .use(swagger({ path: "/swagger" }))
  .use(knowledgeBase)
  .get("/api", () => ({ message: "Elysia API is running" }))
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.url}`)

export type App = typeof app
