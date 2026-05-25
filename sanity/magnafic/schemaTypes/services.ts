import { defineField, defineType } from 'sanity'

export const servicesSchema = defineType({
  name: 'services',
  title: 'Services',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'keyInsights',
      title: 'Key Insights',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'approach',
      title: 'Approach',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'capability',
      title: 'Capability',
      type: 'reference',
      to: [{ type: 'capabilities' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
