import {defineField, defineType} from 'sanity'

export const usageTrackingSchema = defineType({
  name: 'usageTracking',
  title: 'Usage Tracking',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'object',
      fields: [
        defineField({name: 'uid', title: 'Firebase UID', type: 'string'}),
        defineField({name: 'email', title: 'Email', type: 'string'}),
        defineField({name: 'role', title: 'Role', type: 'string'}),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'action', title: 'Action', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'creditsConsumed',
      title: 'Tokens Consumed',
      type: 'number',
      description: 'Actual Gemini total token count for this request.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({name: 'createdAt', title: 'Created At', type: 'datetime', readOnly: true}),
  ],
  orderings: [{title: 'Newest First', name: 'createdAtDesc', by: [{field: 'createdAt', direction: 'desc'}]}],
})
