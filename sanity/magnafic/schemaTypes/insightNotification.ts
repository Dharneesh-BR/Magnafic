import { defineField, defineType } from 'sanity'

export const insightNotificationSchema = defineType({
  name: 'insightNotification',
  title: 'Insight Notifications',
  type: 'document',
  fields: [
    defineField({
      name: 'notificationId',
      title: 'Notification ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'insightId',
      title: 'Insight ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'documentType',
      title: 'Document Type',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'string',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Sending', value: 'sending' },
          { title: 'Sent', value: 'sent' },
          { title: 'Sent With Errors', value: 'sent_with_errors' },
          { title: 'Failed', value: 'failed' },
        ],
      },
    }),
    defineField({
      name: 'attempts',
      title: 'Attempts',
      type: 'number',
    }),
    defineField({
      name: 'subscriberCount',
      title: 'Subscriber Count',
      type: 'number',
    }),
    defineField({
      name: 'sentCount',
      title: 'Sent Count',
      type: 'number',
    }),
    defineField({
      name: 'failedCount',
      title: 'Failed Count',
      type: 'number',
    }),
    defineField({
      name: 'failures',
      title: 'Failures',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'email', title: 'Email', type: 'string' }),
            defineField({ name: 'error', title: 'Error', type: 'text' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'lastError',
      title: 'Last Error',
      type: 'text',
    }),
    defineField({
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      sentCount: 'sentCount',
      failedCount: 'failedCount',
    },
    prepare({ title, status, sentCount, failedCount }) {
      return {
        title: title || 'Insight notification',
        subtitle: [status, `${sentCount || 0} sent`, `${failedCount || 0} failed`].filter(Boolean).join(' | '),
      }
    },
  },
})
