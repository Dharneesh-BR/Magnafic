import { defineField, defineType } from 'sanity'

export const mentorSchema = defineType({
  name: 'mentor',
  title: 'Mentor',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'fullName',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'designation',
      title: 'Designation',
      type: 'string',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'detailedBio',
      title: 'Detailed Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'expertiseAreas',
      title: 'Expertise Areas',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'yearsOfExperience',
      title: 'Years of Experience',
      type: 'number',
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: 'totalSessions',
      title: 'Total Sessions',
      type: 'number',
    }),
    defineField({
      name: 'workshopCount',
      title: 'Workshop Count',
      type: 'number',
    }),
    defineField({
      name: 'courseCount',
      title: 'Course Count',
      type: 'number',
    }),
    defineField({
      name: 'achievements',
      title: 'Achievements',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
  ],
  orderings: [
    {
      title: 'Rating (Highest)',
      name: 'ratingDesc',
      by: [{ field: 'rating', direction: 'desc' }],
    },
    {
      title: 'Years of Experience (Highest)',
      name: 'experienceDesc',
      by: [{ field: 'yearsOfExperience', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'designation',
      media: 'profileImage',
    },
  },
})
