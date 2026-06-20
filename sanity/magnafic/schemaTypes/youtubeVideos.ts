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
