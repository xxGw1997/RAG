import { createHash } from "crypto"
import { existsSync } from "fs"
import { readFile, appendFile } from "fs/promises"
import path from "path"

const MD5_LIST_FILE = path.resolve(import.meta.dir, "../static/md5_list.txt")

export function toMd5(content: string | Buffer): string {
  return createHash("md5").update(content).digest("hex")
}

export async function checkMd5(md5: string): Promise<boolean> {
  if (!existsSync(MD5_LIST_FILE)) return false
  const content = await readFile(MD5_LIST_FILE, "utf-8")
  return content.split("\n").map(l => l.trim()).includes(md5)
}

export async function saveMd5(md5: string): Promise<void> {
  await appendFile(MD5_LIST_FILE, md5 + "\n", "utf-8")
}
