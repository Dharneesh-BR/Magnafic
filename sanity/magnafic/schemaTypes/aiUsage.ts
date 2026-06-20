import {defineField, defineType} from 'sanity'

export const aiUsageSchema = defineType({
  name: 'aiUsage',
  title: 'AI Usage',
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
      name: 'session',
      title: 'Chat Session',
      type: 'reference',
      to: [{type: 'chatSession'}],
    }),
    defineField({
      name: 'actionType',
      title: 'Action Type',
      type: 'string',
      options: {
        list: [
          {title: 'Chat', value: 'chat'},
          {title: 'Report', value: 'report'},
          {title: 'Presentation', value: 'ppt'},
          {title: 'Image', value: 'image'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'creditsConsumed',
      title: 'Credits Consumed',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'prompt',
      title: 'Prompt',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      consultant: 'consultant.fullName',
      actionType: 'actionType',
      credits: 'creditsConsumed',
    },
    prepare({consultant, actionType, credits}) {
      return {
        title: consultant || 'Unknown consultant',
        subtitle: `${actionType || 'AI request'} | ${credits || 0} credits`,
      }
    },
  },
})
