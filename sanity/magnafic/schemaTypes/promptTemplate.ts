import {defineField, defineType} from 'sanity'

export const promptTemplateSchema = defineType({
  name: 'promptTemplate',
  title: 'AI Prompt Template',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'GTM Strategy', value: 'gtm-strategy'},
          {title: 'Market Research', value: 'market-research'},
          {title: 'Brand Strategy', value: 'brand-strategy'},
          {title: 'Digital Transformation', value: 'digital-transformation'},
          {title: 'Organisation Design', value: 'organisation-design'},
          {title: 'International Expansion', value: 'international-expansion'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'promptText',
      title: 'Prompt Text',
      type: 'text',
      rows: 10,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recommendedAgent',
      title: 'Recommended Agent',
      type: 'reference',
      to: [{type: 'aiAgent'}],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      status: 'status',
    },
    prepare({title, category, status}) {
      return {title, subtitle: `${category || 'Uncategorised'} | ${status || 'draft'}`}
    },
  },
})
