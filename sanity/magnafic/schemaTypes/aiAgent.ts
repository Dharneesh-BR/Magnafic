import {defineField, defineType} from 'sanity'

export const AI_SERVICE_LINES = [
  {title: 'AI & Digital Transformation', value: 'ai-digital-transformation'},
  {title: 'Distribution & GTM', value: 'distribution-gtm'},
  {title: 'E-Commerce & D2C', value: 'ecommerce-d2c'},
  {title: 'Brand Strategy & Marketing', value: 'brand-strategy-marketing'},
  {title: 'Organisation & People', value: 'organisation-people'},
  {title: 'International Expansion & GTM', value: 'international-expansion-gtm'},
]

export const aiAgentSchema = defineType({
  name: 'aiAgent',
  title: 'AI Agent',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'serviceLine',
      title: 'Service Line',
      type: 'string',
      options: {list: AI_SERVICE_LINES},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'systemPrompt',
      title: 'System Prompt',
      type: 'text',
      rows: 18,
      description: 'Private operating instructions sent to Gemini with every consultant request.',
      validation: (Rule) => Rule.required().min(100),
    }),
    defineField({
      name: 'enabledTools',
      title: 'Enabled Tools',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Chat', value: 'chat'},
          {title: 'Report', value: 'report'},
          {title: 'Presentation', value: 'ppt'},
          {title: 'Image', value: 'image'},
        ],
        layout: 'grid',
      },
      initialValue: ['chat'],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      serviceLine: 'serviceLine',
      active: 'active',
    },
    prepare({title, serviceLine, active}) {
      const service = AI_SERVICE_LINES.find((item) => item.value === serviceLine)?.title
      return {
        title,
        subtitle: `${service || serviceLine || 'No service line'} | ${active ? 'Active' : 'Inactive'}`,
      }
    },
  },
})
