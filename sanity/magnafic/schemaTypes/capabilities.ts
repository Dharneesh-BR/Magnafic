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
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Controls the order of capabilities across the website. Lower numbers appear first.',
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'icon',
      title: 'Card Icon',
      type: 'string',
      description: 'Choose the icon shown on capability cards.',
      options: {
        list: [
          { title: 'Sparkles', value: 'sparkles' },
          { title: 'Trending Up', value: 'trending-up' },
          { title: 'Target', value: 'target' },
          { title: 'Brain Circuit', value: 'brain-circuit' },
          { title: 'Shopping Bag', value: 'shopping-bag' },
          { title: 'Network', value: 'network' },
          { title: 'Briefcase', value: 'briefcase' },
          { title: 'Bar Chart', value: 'bar-chart' },
          { title: 'Ecommerce', value: 'shopping-cart' },
          { title: 'Bulb', value: 'lightbulb' },
          { title: 'Globe', value: 'globe' },
          { title: 'User', value: 'user' },
          { title: 'AI', value: 'bot' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'sparkles',
    }),
    defineField({
      name: 'orderedExperts',
      title: 'Ordered Experts',
      type: 'array',
      description: 'Drag experts into the order they should appear for this capability. Experts listed here appear first.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mentor' }],
        },
      ],
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
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              description: 'description',
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((items) => {
          if (!items) return true
          const invalidItems = items.filter(
            (item) => !item || typeof item !== 'object' || Array.isArray(item) || !(item as any).title
          )
          if (invalidItems.length > 0) {
            return 'All items must be objects with a title field'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      displayOrder: 'displayOrder',
    },
    prepare({ title, subtitle, displayOrder }) {
      return {
        title,
        subtitle: `${displayOrder ?? 'No order'}${subtitle ? ` - ${subtitle}` : ''}`,
      }
    },
  },
})
