import { PostgresStore } from '@mastra/pg'
import DbFactory from '../infrastructure/database/db.factory.js'

const aiDatabase = DbFactory.getAIDatabase()

export const aiStorage = new PostgresStore({
    id: 'ai-database-storage',
    pool: aiDatabase.getPool(),
    schemaName: 'mastra',
})