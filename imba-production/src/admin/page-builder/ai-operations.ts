import type { Data } from '@puckeditor/core'
import { config } from './puck.config'

/**
 * Agent-native action model for the AI page assistant: the LLM returns a list
 * of operations over the Puck block tree, which we validate and apply
 * client-side. Same data model the visual editor and <Render> use — no drift.
 */

export type AIOperation =
  | { op: 'add'; component: string; props?: Record<string, unknown>; index?: number }
  | { op: 'update'; id: string; props: Record<string, unknown> }
  | { op: 'remove'; id: string }
  | { op: 'move'; id: string; toIndex: number }

export interface AIResponse {
  reply: string
  operations: AIOperation[]
}

type CompDef = { fields?: Record<string, { type?: string }>; defaultProps?: Record<string, unknown> }
type Item = { type: string; props: Record<string, unknown> }

const components = config.components as unknown as Record<string, CompDef>

/** Human-readable catalogue of block types + their fields, fed to the model. */
export function describeBlocks(): string {
  return Object.entries(components).map(([name, c]) => {
    const fields = c.fields
      ? Object.entries(c.fields).map(([k, f]) => `${k}:${f?.type ?? 'text'}`).join(', ')
      : '(none)'
    return `- ${name} — fields: [${fields}]; defaults: ${JSON.stringify(c.defaultProps ?? {})}`
  }).join('\n')
}

/** Ordered list of the page's current blocks (id + type + props) for grounding. */
export function describeContent(data: Data): string {
  const content = contentOf(data)
  if (!content.length) return '(the page is currently empty)'
  return content.map((it, i) => {
    const props = { ...it.props }
    delete props.id
    return `${i}. ${it.type} (id="${String(it.props.id ?? '')}") ${JSON.stringify(props)}`
  }).join('\n')
}

function contentOf(data: Data): Item[] {
  const c = (data as { content?: unknown }).content
  return Array.isArray(c) ? (c as Item[]) : []
}

function genId(component: string): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return `${component}-${rand}`
}

/** Validate + apply operations to a copy of the page data. Pure. */
export function applyOperations(
  data: Data,
  ops: AIOperation[],
): { data: Data; applied: string[]; skipped: string[] } {
  const content = [...contentOf(data)]
  const applied: string[] = []
  const skipped: string[] = []
  const indexOfId = (id: string) => content.findIndex(it => it.props?.id === id)

  for (const op of ops) {
    switch (op?.op) {
      case 'add': {
        if (!components[op.component]) { skipped.push(`add: unknown block "${op.component}"`); break }
        const id = genId(op.component)
        const item: Item = {
          type: op.component,
          props: { ...(components[op.component].defaultProps ?? {}), ...(op.props ?? {}), id },
        }
        const at = typeof op.index === 'number' ? Math.max(0, Math.min(op.index, content.length)) : content.length
        content.splice(at, 0, item)
        applied.push(`added ${op.component}`)
        break
      }
      case 'update': {
        const i = indexOfId(op.id)
        if (i < 0) { skipped.push(`update: id "${op.id}" not found`); break }
        content[i] = { ...content[i], props: { ...content[i].props, ...op.props, id: op.id } }
        applied.push(`updated ${content[i].type}`)
        break
      }
      case 'remove': {
        const i = indexOfId(op.id)
        if (i < 0) { skipped.push(`remove: id "${op.id}" not found`); break }
        const [removed] = content.splice(i, 1)
        applied.push(`removed ${removed.type}`)
        break
      }
      case 'move': {
        const i = indexOfId(op.id)
        if (i < 0) { skipped.push(`move: id "${op.id}" not found`); break }
        const [item] = content.splice(i, 1)
        const to = Math.max(0, Math.min(op.toIndex, content.length))
        content.splice(to, 0, item)
        applied.push(`moved ${item.type}`)
        break
      }
      default:
        skipped.push(`unknown operation`)
    }
  }

  return { data: { ...(data as object), content } as Data, applied, skipped }
}

/** Build the full instruction prompt for one assistant turn. */
export function buildPrompt(data: Data, userInstruction: string, history: string): string {
  return [
    'You are an AI assistant that builds and edits web pages composed of blocks.',
    'You edit the page by returning JSON operations over its block list.',
    '',
    'AVAILABLE BLOCK TYPES:',
    describeBlocks(),
    '',
    'CURRENT PAGE BLOCKS (in order):',
    describeContent(data),
    '',
    history ? `RECENT CONVERSATION:\n${history}\n` : '',
    'Respond with ONLY valid JSON (no markdown fences) of shape:',
    '{ "reply": string, "operations": Operation[] }',
    'Where Operation is one of:',
    '  {"op":"add","component":<one of the block types above>,"props":{...},"index"?:<0-based position>}',
    '  {"op":"update","id":<existing block id>,"props":{...only the fields to change...}}',
    '  {"op":"remove","id":<existing block id>}',
    '  {"op":"move","id":<existing block id>,"toIndex":<0-based position>}',
    'Rules: only use the listed block types; only set fields that exist on that block;',
    'reference existing blocks by their exact id; keep "reply" short, friendly, first-person,',
    'describing what you changed. If no change is needed, return an empty operations array.',
    '',
    `USER: ${userInstruction}`,
  ].filter(line => line !== '').join('\n')
}
