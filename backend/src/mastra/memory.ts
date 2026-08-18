import { Memory } from '@mastra/memory'
import { aiStorage } from '@/mastra/storage.js'

export const researchMemory = new Memory({
  storage: aiStorage,
  options: {
    lastMessages: 20,          
    generateTitle: true,       
  },
})