import { defineField, defineType } from 'sanity'

export const problemQuestionSchema = defineType({
  name: 'problemQuestion',
  title: 'Describe Your Problem Questions',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'helperText',
      title: 'Helper Text',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'questionKey',
      title: 'Question Key',
      type: 'slug',
      description: 'Stable internal key for this question, for example sales-growth-stage.',
      options: {
        source: 'question',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isStartQuestion',
      title: 'Start Question',
      type: 'boolean',
      description: 'Enable this on the first question in the flow. If more than one is enabled, the lowest display order is used.',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Controls the order in which questions appear. Lower numbers appear first.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'options',
      title: 'MCQ Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Option Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Option Value',
              type: 'string',
              description: 'Optional internal value. If empty, the label will be used.',
            }),
            defineField({
              name: 'routeTag',
              title: 'Route Tag',
              type: 'string',
              description: 'Optional tag for reporting or matching, for example sales, branding, ops.',
            }),
            defineField({
              name: 'capability',
              title: 'Selected Capability',
              type: 'reference',
              description: 'Optional capability used to route this answer to the experts listed on that capability.',
              to: [{ type: 'capabilities' }],
            }),
            defineField({
              name: 'nextQuestion',
              title: 'Next Question',
              type: 'reference',
              description: 'Choose the next question for this answer. Leave empty to complete the questionnaire.',
              to: [{ type: 'problemQuestion' }],
            }),
          ],
          preview: {
            select: {
              title: 'label',
              value: 'value',
              routeTag: 'routeTag',
              capability: 'capability.title',
              nextQuestion: 'nextQuestion.question',
            },
            prepare({ title, value, routeTag, capability, nextQuestion }) {
              return {
                title,
                subtitle: [
                  value,
                  routeTag ? `tag: ${routeTag}` : '',
                  capability ? `capability: ${capability}` : '',
                  nextQuestion ? `next: ${nextQuestion}` : 'ends flow',
                ].filter(Boolean).join(' | '),
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2),
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'question',
      displayOrder: 'displayOrder',
      isActive: 'isActive',
    },
    prepare({ title, displayOrder, isActive }) {
      return {
        title,
        subtitle: `${displayOrder ?? 'No order'} - ${isActive === false ? 'Inactive' : 'Active'}`,
      }
    },
  },
})
