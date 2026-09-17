import { Mastra } from '@mastra/core'
import { catalogCopilotAgent } from './agents/catalog-copilot.agent.js'
import { universalGateway } from './gateway.js'
import { aiStorage } from './storage.js'
import { agentObservability } from './agent-obeservablity.js'

const mastra = new Mastra({
    observability: agentObservability,
    gateways: { universalGateway },
    storage: aiStorage,
    agents: {
        catalogCopilotAgent,
    },
    memory: {},
})

export default mastra