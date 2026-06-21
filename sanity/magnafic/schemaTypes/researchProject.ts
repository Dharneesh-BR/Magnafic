import {defineField, defineType} from 'sanity'

export const researchProjectSchema = defineType({
  name: 'researchProject',
  title: 'Research Project',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
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
      name: 'workflow',
      title: 'Workflow',
      type: 'reference',
      to: [{type: 'workflow'}],
      description: 'The Magnafic Copilot workflow used to generate this report.',
    }),
    defineField({name: 'industry', title: 'Industry', type: 'string'}),
    defineField({name: 'question', title: 'Question', type: 'text', rows: 5, validation: (Rule) => Rule.required()}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {list: ['processing', 'completed', 'failed'], layout: 'radio'},
      initialValue: 'processing',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'createdAt', title: 'Created At', type: 'datetime', readOnly: true}),
  ],
  orderings: [{title: 'Newest First', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]}],
})
