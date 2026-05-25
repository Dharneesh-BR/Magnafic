import { defineField, defineType } from 'sanity'

export const capabilitiesSchema = defineType({
  name: 'capabilities',
  title: 'Capabilities',
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
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'aboutCapabilities',
      title: 'About Capabilities',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'useCases',
      title: 'Use Cases',
      type: 'text',
    }),
    defineField({
      name: 'useCasesList',
      title: 'Use Cases List',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
    },
  },
})
