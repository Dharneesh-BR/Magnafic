import {defineArrayMember, defineField, defineType} from 'sanity'

export const chatSessionSchema = defineType({
  name: 'chatSession',
  title: 'Magnafic Copilot Chat Session',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'object',
      fields: [
        defineField({name: 'uid', title: 'Firebase UID', type: 'string'}),
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({name: 'email', title: 'Email', type: 'string'}),
        defineField({name: 'role', title: 'Role', type: 'string'}),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'project',
      title: 'Latest Research Project',
      type: 'reference',
      to: [{type: 'researchProject'}],
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
              name: 'report',
              title: 'Structured Report JSON',
              type: 'text',
              rows: 12,
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
      user: 'user.email',
    },
    prepare({title, user}) {
      return {title, subtitle: user || 'Unknown user'}
    },
  },
})
