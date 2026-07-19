import { defineArrayMember, defineField, defineType } from 'sanity'

export const youtubeVideosSchema = defineType({
  name: 'youtubeVideos',
  title: 'YouTube Videos',
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
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste the full YouTube video link.',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      description: 'Upload the thumbnail image to show for this video.',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'capability',
      title: 'Related Capability',
      type: 'reference',
      to: [{ type: 'capabilities' }],
    }),
    defineField({
      name: 'experts',
      title: 'Related Experts',
      type: 'array',
      description: 'Tag every expert associated with this video so it appears in their Insights section.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'mentor' }],
          options: { disableNew: true },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Optional display duration, for example 4:32.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'emailContent',
      title: 'Email Content',
      type: 'object',
      description:
        'Optional content used only in subscriber emails. Leave blank to send the standard video description and thumbnail.',
      fields: [
        defineField({
          name: 'body',
          title: 'Email Body',
          type: 'text',
          rows: 6,
          description: 'Short email-only body copy. Use this to add context that should appear in the email.',
          validation: (Rule) => Rule.max(1200),
        }),
        defineField({
          name: 'image',
          title: 'Email Body Image',
          type: 'image',
          options: {
            hotspot: true,
            accept: 'image/*',
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          description: 'Optional image shown inside the email body below the description.',
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Published Date (Newest)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'youtubeUrl',
      media: 'thumbnail',
    },
  },
})
