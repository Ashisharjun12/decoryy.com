import { _config } from '@/config/config.js'

export const UNIVERSAL_GATEWAY_ID = 'universal'
export const UNIVERSAL_PROVIDER_ID = 'main'

/** Routes LLM calls through UniversalGateway → any OpenAI-compatible API. */
export function toUniversalModelId(model?: string): string {
    const raw = model ?? _config.LLM_MODEL
    if (!raw) {
        throw new Error('LLM_MODEL is missing from environment')
    }
    if (raw.startsWith(`${UNIVERSAL_GATEWAY_ID}/`)) {
        return raw
    }
    return `${UNIVERSAL_GATEWAY_ID}/${UNIVERSAL_PROVIDER_ID}/${raw}`
}

export const agentModel = toUniversalModelId()
export const toolAgentModel = toUniversalModelId(_config.LLM_TOOL_MODEL ?? _config.LLM_MODEL)
export const guardrailModel = toUniversalModelId(_config.GUARDRAIL_MODEL ?? _config.LLM_MODEL)