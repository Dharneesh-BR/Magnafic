import {createClient} from '@sanity/client'

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.VITE_SANITY_WRITE_TOKEN

if (!token) {
  throw new Error('Set SANITY_API_TOKEN or VITE_SANITY_WRITE_TOKEN before seeding workflows.')
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '8pf5fxwy',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

const workflows = [
  {
    slug: 'market-research',
    name: 'Market Research',
    priority: 100,
    description: 'Evaluates market attractiveness, demand, trends, segments, competition, pricing, channels, opportunities, and risks.',
    example: 'Should we launch a premium protein snack brand in India? Identify the best customer segment, pricing, channels, risks, and a 90-day validation plan.',
    instructions: 'Think like a senior market intelligence consultant. Define the decision, analyze demand drivers, customer segments, competitive intensity, pricing, channels, barriers, risks, and validation needs. Distinguish known inputs from assumptions and avoid unsupported market-size claims.',
    output: 'Generate an executive market research report with executive summary, market insights, key findings, opportunities, risks, strategic recommendations, next steps, and data-backed tables or charts when defensible.',
  },
  {
    slug: 'gtm-strategy',
    name: 'GTM Strategy',
    priority: 90,
    description: 'Designs practical go-to-market strategies covering audience, positioning, channels, launch, economics, KPIs, and execution.',
    example: 'Create a GTM strategy for launching our B2B SaaS product to mid-market manufacturing companies in India.',
    instructions: 'Think like a go-to-market operator. Analyze ideal customer profiles, value proposition, buying journey, channel roles, pricing, sales motion, partnerships, launch sequencing, economics, operating dependencies, and execution risks.',
    output: 'Generate a GTM strategy with target segments, positioning, channel strategy, pricing logic, launch roadmap, KPIs, risks, owners, and immediate experiments.',
  },
  {
    slug: 'brand-strategy',
    name: 'Brand Strategy',
    priority: 80,
    description: 'Creates differentiated brand positioning, audience choices, value propositions, messaging, portfolio logic, and activation priorities.',
    example: 'Develop a brand strategy for a premium Ayurveda skincare brand targeting urban Indian women aged 25-40.',
    instructions: 'Think like a senior brand strategist. Identify the target audience, category context, consumer tension, competitive frame, meaningful differentiation, reasons to believe, brand promise, personality, messaging hierarchy, and activation implications.',
    output: 'Generate a brand strategy containing audience definition, positioning, value proposition, differentiation, messaging pillars, proof points, risks, recommendations, and activation next steps.',
  },
  {
    slug: 'competitor-analysis',
    name: 'Competitor Analysis',
    priority: 75,
    description: 'Compares competitors, business models, propositions, strengths, weaknesses, positioning, channels, and strategic whitespace.',
    example: 'Compare Swiggy, Zomato, and ONDC for a new food delivery partnership strategy. Show strengths, risks, and whitespace.',
    instructions: 'Think like a competitive intelligence analyst. Define the comparison criteria, separate direct and indirect competitors, assess propositions, customer focus, pricing, channels, capabilities, strengths, weaknesses, and likely strategic responses. Never invent competitor facts.',
    output: 'Generate a competitive landscape report with comparison criteria, competitor table, strengths and weaknesses, market gaps, threats, strategic implications, and recommended responses.',
  },
  {
    slug: 'consumer-insights',
    name: 'Consumer Insights',
    priority: 70,
    description: 'Develops consumer hypotheses, segments, needs, motivations, barriers, journeys, and research priorities.',
    example: 'Identify consumer insights for Gen Z buyers choosing affordable electric scooters in Tier 1 and Tier 2 Indian cities.',
    instructions: 'Think like a consumer insights lead. Analyze consumer jobs, functional and emotional needs, motivations, barriers, occasions, behaviors, decision criteria, journey stages, segment differences, and evidence gaps. Treat unsupported behavioral claims as hypotheses.',
    output: 'Generate a consumer insight report with segment hypotheses, needs, motivations, barriers, journey insights, opportunity areas, research questions, recommendations, and validation plan.',
  },
  {
    slug: 'business-plan',
    name: 'Business Plan',
    priority: 65,
    description: 'Structures a decision-ready business plan covering opportunity, model, customers, economics, operations, risks, and milestones.',
    example: 'Create a business plan for an AI-powered admissions counseling platform for Indian students applying abroad.',
    instructions: 'Think like a venture strategist and operating advisor. Evaluate the problem, solution, customer, market, business model, revenue logic, cost drivers, capabilities, routes to market, operational plan, assumptions, risks, and milestones.',
    output: 'Generate a business plan with opportunity, customer, solution, business model, revenue model, operating model, financial assumptions, risks, milestones, recommendations, and next steps.',
  },
  {
    slug: 'investor-pitch',
    name: 'Investor Pitch',
    priority: 60,
    description: 'Builds an investor-ready narrative around problem, solution, market, model, traction, moat, economics, team, and ask.',
    example: 'Prepare an investor pitch narrative for a seed-stage fintech helping small businesses manage cash flow.',
    instructions: 'Think like an investor and fundraising advisor. Pressure-test the problem, solution, market logic, business model, traction, competitive advantage, unit economics, scalability, team gaps, funding use, milestones, and investor objections.',
    output: 'Generate an investor pitch narrative with slide-ready sections for problem, solution, opportunity, business model, traction, competition, moat, economics, roadmap, team, funding ask, risks, and evidence gaps.',
  },
  {
    slug: 'international-expansion',
    name: 'International Expansion',
    priority: 55,
    description: 'Assesses market selection, entry strategy, localization, channels, partners, economics, regulation, risks, and rollout.',
    example: 'Assess whether our Indian D2C wellness brand should expand to UAE or Singapore first, with entry strategy and risks.',
    instructions: 'Think like an international expansion strategist. Evaluate market attractiveness, strategic fit, customer demand, localization, regulatory questions, entry modes, channel partners, economics, operating requirements, sequencing, and exit criteria.',
    output: 'Generate an international expansion assessment with market criteria, entry options, localization needs, partner strategy, commercial model, risks, phased roadmap, KPIs, and go/no-go recommendations.',
  },
  {
    slug: 'opportunity-assessment',
    name: 'Opportunity Assessment',
    priority: 50,
    description: 'Evaluates the attractiveness, feasibility, economics, risks, and validation path for a new business opportunity.',
    example: 'Evaluate the opportunity to launch a subscription-based healthy office lunch service for Bengaluru tech companies.',
    instructions: 'Think like a strategy consultant evaluating an investment decision. Assess customer need, strategic fit, market attractiveness, differentiation, feasibility, economics, capabilities, dependencies, risks, alternatives, and evidence required before commitment.',
    output: 'Generate an opportunity assessment with attractiveness, feasibility, pros, cons, strategic fit, assumptions, risks, decision criteria, recommendation, and a staged validation plan.',
  },
]

const transaction = client.transaction()

for (const workflow of workflows) {
  transaction.createOrReplace({
    _id: `workflow-${workflow.slug}`,
    _type: 'workflow',
    workflowName: workflow.name,
    slug: {_type: 'slug', current: workflow.slug},
    description: workflow.description,
    exampleInput: workflow.example,
    workflowInstructions: workflow.instructions,
    knowledgeAssets: [],
    outputInstructions: workflow.output,
    priority: workflow.priority,
    active: true,
  })
}

const result = await transaction.commit()
console.log(`Seeded ${workflows.length} workflows in transaction ${result.transactionId}.`)
