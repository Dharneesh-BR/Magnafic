import {defineArrayMember, defineField, defineType} from 'sanity'

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx', 'csv']

export const workflowSchema = defineType({
  name: 'workflow',
  title: 'AI Workflow',
  type: 'document',
  fields: [
    defineField({
      name: 'workflowName',
      title: 'Workflow Name',
      type: 'string',
      description: 'Administrative name used to identify this AI workflow.',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Unique identifier used by the workflow selection and execution engine.',
      options: {
        source: 'workflowName',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Explain the business purpose, intended users, and situations this workflow handles.',
      validation: (Rule) => Rule.required().min(20).max(1000),
    }),
    defineField({
      name: 'workflowInstructions',
      title: 'Workflow Instructions',
      type: 'text',
      rows: 18,
      description:
        'Master Gemini framework covering methodology, reasoning, validation, writing style, recommendations, and decision-making.',
      validation: (Rule) => Rule.required().min(100),
    }),
    defineField({
      name: 'knowledgeAssets',
      title: 'Knowledge Assets',
      type: 'array',
      description:
        'Proprietary reports, models, methodologies, playbooks, templates, case studies, and supporting research loaded when this workflow executes.',
      of: [
        defineArrayMember({
          name: 'knowledgeAsset',
          title: 'Knowledge Asset',
          type: 'file',
          options: {
            accept: '.pdf,.docx,.pptx,.xlsx,.csv',
            storeOriginalFilename: true,
          },
          fields: [
            defineField({
              name: 'title',
              title: 'Asset Title',
              type: 'string',
              description: 'Human-readable name shown to workflow administrators.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Asset Description',
              type: 'text',
              rows: 3,
              description: 'Explain what this asset contains and when Gemini should use it.',
            }),
          ],
          validation: (Rule) => Rule.custom((file) => {
            const extension = file?.asset?._ref?.split('-').pop()?.toLowerCase()

            if (!extension || SUPPORTED_EXTENSIONS.includes(extension)) return true
            return 'Upload a PDF, DOCX, PPTX, XLSX, or CSV file.'
          }),
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'outputInstructions',
      title: 'Output Instructions',
      type: 'text',
      rows: 12,
      description:
        'Define the required report structure, sections, level of detail, tables, charts, tone, and final deliverable.',
      validation: (Rule) => Rule.required().min(50),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Higher-priority active workflows are preferred when multiple workflows match a query.',
      initialValue: 1,
      validation: (Rule) => Rule.required().integer().min(1).max(1000),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Only active workflows are available to the workflow selection engine.',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Priority: High to Low',
      name: 'priorityDesc',
      by: [
        {field: 'priority', direction: 'desc'},
        {field: 'workflowName', direction: 'asc'},
      ],
    },
    {
      title: 'Name: A-Z',
      name: 'workflowNameAsc',
      by: [{field: 'workflowName', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'workflowName',
      priority: 'priority',
      active: 'active',
    },
    prepare({title, priority, active}) {
      return {
        title: title || 'Untitled workflow',
        subtitle: `Priority ${priority ?? 1} | ${active === false ? 'Inactive' : 'Active'}`,
      }
    },
  },
})
