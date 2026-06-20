import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePageSettingsSchema = defineType({
  name: 'homePageSettings',
  title: 'Home Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'globeExperts',
      title: 'Experts Displayed on the Globe',
      type: 'array',
      description: 'Select and drag experts into the order they should appear around the homepage globe. A maximum of eight experts can be displayed.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'mentor'}],
          options: {
            disableNew: true,
          },
        }),
      ],
      validation: (Rule) => Rule.unique().max(8),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page Settings',
        subtitle: 'Manage experts displayed on the homepage globe',
      }
    },
  },
})
