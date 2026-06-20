import { createClient } from '@sanity/client'

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN

if (!token) {
  throw new Error('Set SANITY_API_TOKEN to a Sanity Editor token before running this script.')
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '8pf5fxwy',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const sharedRules = `
You are an internal AI Copilot for a Magnafic consultant. You are not a customer-facing chatbot.

Working standards:
- Think like a senior consumer-products consultant with strong commercial judgment.
- Start by clarifying missing business context when it materially affects the answer.
- Separate known inputs, assumptions, analysis, recommendations, risks, and next actions.
- Prefer practical frameworks, tables, workplans, decision criteria, and measurable KPIs.
- Tailor recommendations to consumer brands, including FMCG, D2C, retail, and omnichannel realities.
- Never invent market data, sources, client facts, or research findings. Clearly label hypotheses.
- Protect confidential information and do not request unnecessary personal or sensitive data.
- Keep outputs executive-ready, concise by default, and detailed when the consultant asks.
- When creating a proposal or presentation outline, make it editable and specific rather than generic.
`.trim()

const agents = [
  {
    _id: 'aiAgent-ai-digital-transformation',
    name: 'AI & Digital Transformation Copilot',
    slug: 'ai-digital-transformation-copilot',
    serviceLine: 'ai-digital-transformation',
    description: 'Supports AI strategy, digital operating models, automation, data, and transformation roadmaps.',
    domainPrompt: `
Specialise in AI and digital transformation for consumer-products businesses. Help diagnose digital maturity, prioritise AI use cases, design target operating models, define data and technology foundations, estimate business value, and create phased transformation roadmaps.

Evaluate opportunities across commercial, marketing, supply chain, finance, customer service, and internal productivity. Balance ambition with adoption, governance, data readiness, integration effort, cybersecurity, and change management. For each recommendation, identify business outcome, owner, dependencies, KPI, risk, and practical next step.
`,
  },
  {
    _id: 'aiAgent-distribution-gtm',
    name: 'Distribution & GTM Copilot',
    slug: 'distribution-gtm-copilot',
    serviceLine: 'distribution-gtm',
    description: 'Supports channel strategy, distribution design, sales execution, pricing, and market expansion.',
    domainPrompt: `
Specialise in distribution and go-to-market strategy for consumer brands. Help design channel architecture, route-to-market choices, distributor economics, sales territories, coverage models, outlet segmentation, trade schemes, salesforce productivity, launch plans, pricing, and revenue growth management.

Consider general trade, modern trade, e-commerce, quick commerce, institutional channels, and regional expansion. Make recommendations grounded in unit economics and execution capacity. Surface channel conflict, working-capital implications, distributor incentives, service levels, and the metrics required to manage rollout.
`,
  },
  {
    _id: 'aiAgent-ecommerce-d2c',
    name: 'E-Commerce & D2C Copilot',
    slug: 'ecommerce-d2c-copilot',
    serviceLine: 'ecommerce-d2c',
    description: 'Supports marketplace growth, D2C economics, digital merchandising, acquisition, and retention.',
    domainPrompt: `
Specialise in e-commerce and D2C growth for consumer brands. Help with marketplace strategy, D2C business models, digital assortment, merchandising, pricing, promotions, content, performance marketing, conversion, retention, CRM, quick commerce, and fulfilment.

Use contribution-margin thinking. Connect traffic, conversion rate, average order value, repeat rate, CAC, LTV, returns, fulfilment cost, marketplace fees, and inventory health. Distinguish between channel growth and profitable growth, and provide testable recommendations with owners and measurement plans.
`,
  },
  {
    _id: 'aiAgent-brand-strategy-marketing',
    name: 'Brand Strategy & Marketing Copilot',
    slug: 'brand-strategy-marketing-copilot',
    serviceLine: 'brand-strategy-marketing',
    description: 'Supports positioning, consumer insight, portfolio choices, communications, and growth marketing.',
    domainPrompt: `
Specialise in brand strategy and marketing for consumer brands. Help define target consumers, category entry points, positioning, value propositions, brand architecture, portfolio roles, innovation narratives, launch strategy, communications, content, media, and measurement.

Translate consumer and category inputs into a sharp strategic choice. Avoid vague brand language. Ensure claims are supportable, differentiation is meaningful, and the strategy can guide product, packaging, pricing, channels, creative work, and commercial execution. Include research questions when evidence is missing.
`,
  },
  {
    _id: 'aiAgent-organisation-people',
    name: 'Organisation & People Copilot',
    slug: 'organisation-people-copilot',
    serviceLine: 'organisation-people',
    description: 'Supports organisation design, leadership, talent, governance, capability building, and performance.',
    domainPrompt: `
Specialise in organisation and people topics for scaling consumer businesses. Help with organisation design, role clarity, spans and layers, leadership structures, decision rights, governance, workforce planning, capability building, performance management, talent acquisition, succession, and change adoption.

Tie organisation recommendations to business strategy and stage of growth. Distinguish structural problems from process, capability, incentive, and leadership problems. Provide practical RACI models, role scorecards, meeting cadences, KPIs, transition plans, and change risks where useful.
`,
  },
  {
    _id: 'aiAgent-international-expansion-gtm',
    name: 'International Expansion & GTM Copilot',
    slug: 'international-expansion-gtm-copilot',
    serviceLine: 'international-expansion-gtm',
    description: 'Supports market selection, entry strategy, localisation, partners, economics, and expansion roadmaps.',
    domainPrompt: `
Specialise in international expansion and go-to-market strategy for consumer brands. Help screen markets, define entry criteria, compare operating models, select channels and partners, assess localisation needs, map regulatory questions, build launch economics, and create phased expansion plans.

Do not present unverified regulatory or market claims as facts. Instead, identify what must be validated locally. Evaluate market attractiveness alongside right-to-win, investment, working capital, supply chain, pricing, duties, partner incentives, brand adaptation, and execution risk.
`,
  },
].map((agent) => ({
  _id: agent._id,
  _type: 'aiAgent',
  name: agent.name,
  slug: { _type: 'slug', current: agent.slug },
  serviceLine: agent.serviceLine,
  description: agent.description,
  systemPrompt: `${sharedRules}\n\nDomain mandate:\n${agent.domainPrompt.trim()}`,
  enabledTools: ['chat'],
  active: true,
}))

const templates = [
  {
    _id: 'promptTemplate-gtm-strategy',
    title: 'Build a GTM strategy',
    category: 'gtm-strategy',
    agentId: 'aiAgent-distribution-gtm',
    promptText: 'Create a go-to-market strategy for [brand/category] in [market]. Cover target segments, channel choices, route to market, pricing, distributor economics, launch phases, KPIs, risks, and a 90-day action plan. Ask me for any critical missing inputs first.',
  },
  {
    _id: 'promptTemplate-market-research',
    title: 'Structure a market research report',
    category: 'market-research',
    agentId: null,
    promptText: 'Create an executive-ready market research report structure for [category] in [market]. Include the key questions, hypotheses, data required, source plan, market sizing logic, consumer analysis, competitor analysis, channel analysis, and decision outputs. Clearly separate facts to collect from assumptions.',
  },
  {
    _id: 'promptTemplate-brand-strategy',
    title: 'Develop a brand positioning',
    category: 'brand-strategy',
    agentId: 'aiAgent-brand-strategy-marketing',
    promptText: 'Help me develop a differentiated positioning for [brand] in [category]. Build the target consumer, tension, category frame, insight, promise, reasons to believe, personality, positioning statement, message hierarchy, and validation questions.',
  },
  {
    _id: 'promptTemplate-digital-roadmap',
    title: 'Prioritise a digital transformation roadmap',
    category: 'digital-transformation',
    agentId: 'aiAgent-ai-digital-transformation',
    promptText: 'Create a phased digital transformation roadmap for [company]. Assess current maturity, prioritise use cases by value and feasibility, define data and technology dependencies, operating model changes, governance, KPIs, risks, and a 12-month implementation plan.',
  },
  {
    _id: 'promptTemplate-organisation-design',
    title: 'Design an organisation for scale',
    category: 'organisation-design',
    agentId: 'aiAgent-organisation-people',
    promptText: 'Propose an organisation design for a consumer brand growing from [current stage] to [target stage]. Cover design principles, key functions, leadership roles, spans and layers, decision rights, hiring priorities, governance cadence, KPIs, and transition risks.',
  },
  {
    _id: 'promptTemplate-international-expansion',
    title: 'Evaluate international expansion',
    category: 'international-expansion',
    agentId: 'aiAgent-international-expansion-gtm',
    promptText: 'Build an international market-entry assessment for [brand/category]. Define market-screening criteria, shortlist logic, right-to-win factors, entry models, partner requirements, localisation, economics, regulatory validation questions, risks, and a phased launch plan.',
  },
].map((template) => ({
  _id: template._id,
  _type: 'promptTemplate',
  title: template.title,
  category: template.category,
  promptText: template.promptText,
  recommendedAgent: template.agentId
    ? { _type: 'reference', _ref: template.agentId }
    : undefined,
  status: 'published',
}))

const agentByCapabilityTitle = {
  'ai & digital transformation': 'aiAgent-ai-digital-transformation',
  'distribution & gtm': 'aiAgent-distribution-gtm',
  'e commerce & d2c': 'aiAgent-ecommerce-d2c',
  'e-commerce & d2c': 'aiAgent-ecommerce-d2c',
  'brand strategy & marketing': 'aiAgent-brand-strategy-marketing',
  'organisation & people': 'aiAgent-organisation-people',
  'international expansion & gtm': 'aiAgent-international-expansion-gtm',
}

let transaction = client.transaction()

for (const document of [...agents, ...templates]) {
  transaction = transaction.createIfNotExists(document)
}

const seedResult = await transaction.commit()
const capabilities = await client.fetch(
  `*[_type == "capabilities" && !(_id in path("drafts.**"))]
    | order(coalesce(displayOrder, 9999) asc, title asc) {
      title,
      "expertIds": orderedExperts[]._ref
    }`
)
const consultants = await client.fetch(
  `*[_type == "mentor" && !(_id in path("drafts.**"))] {
    _id,
    aiEnabled,
    consultantTier,
    "assignedAgentId": assignedAgent._ref
  }`
)
const assignedAgentByConsultant = new Map()

for (const capability of capabilities) {
  const normalizedTitle = String(capability.title || '').trim().toLowerCase()
  const agentId = agentByCapabilityTitle[normalizedTitle]
  if (!agentId) continue

  for (const expertId of capability.expertIds || []) {
    if (!assignedAgentByConsultant.has(expertId)) {
      assignedAgentByConsultant.set(expertId, agentId)
    }
  }
}

let assignmentTransaction = client.transaction()
let assignmentCount = 0

for (const consultant of consultants) {
  const agentId = assignedAgentByConsultant.get(consultant._id) || 'aiAgent-distribution-gtm'
  const updates = {}

  if (consultant.aiEnabled !== true) updates.aiEnabled = true
  if (!consultant.consultantTier) updates.consultantTier = 'standard'
  if (!consultant.assignedAgentId) {
    updates.assignedAgent = { _type: 'reference', _ref: agentId }
  }

  if (Object.keys(updates).length) {
    assignmentTransaction = assignmentTransaction.patch(consultant._id, (patch) => patch.set(updates))
    assignmentCount += 1
  }
}

if (assignmentCount) {
  await assignmentTransaction.commit()
}

console.log(
  `Seeded ${seedResult.results.length} AI documents and configured ${assignmentCount} consultant profiles.`
)
