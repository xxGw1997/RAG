import { spawn } from "child_process"

const backend = spawn("bun", ["run", "--filter", "@rag-project/backend", "dev"], {
  stdio: "inherit",
  shell: true,
})

const frontend = spawn("bun", ["run", "--filter", "@rag-project/frontend", "dev"], {
  stdio: "inherit",
  shell: true,
})

process.on("SIGINT", () => {
  backend.kill()
  frontend.kill()
  process.exit(0)
})

process.on("SIGTERM", () => {
  backend.kill()
  frontend.kill()
  process.exit(0)
})
