import {defineArrayMember, defineField, defineType} from 'sanity'

export const chatSessionSchema = defineType({
  name: 'chatSession',
  title: 'AI Chat Session',
  type: 'document',
  fields: [
    defineField({
      name: 'consultant',
      title: 'Consultant',
      type: 'reference',
      to: [{type: 'mentor'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'agent',
      title: 'Agent',
      type: 'reference',
      to: [{type: 'aiAgent'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sessionTitle',
      title: 'Session Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'messages',
      title: 'Messages',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              options: {
                list: [
                  {title: 'User', value: 'user'},
                  {title: 'Assistant', value: 'assistant'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'text',
              rows: 8,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'role', subtitle: 'content'},
          },
        }),
      ],
      initialValue: [],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Recently Updated',
      name: 'updatedAtDesc',
      by: [{field: 'updatedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'sessionTitle',
      consultant: 'consultant.fullName',
      agent: 'agent.name',
    },
    prepare({title, consultant, agent}) {
      return {title, subtitle: [consultant, agent].filter(Boolean).join(' | ')}
    },
  },
})
