import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const config = {
  port: Number(process.env.PORT ?? 8787),
  databasePath: process.env.DATABASE_PATH ?? path.join(backendRoot, 'data', 'stylesnap.db'),
  openApiPath: path.resolve(backendRoot, '..', 'contracts', 'api.json'),
}
