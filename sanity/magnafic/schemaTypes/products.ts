import {defineArrayMember, defineField, defineType} from 'sanity'

export const productsSchema = defineType({
  name: 'products',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
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
      description: 'Only Published products appear on the website and in the Products dropdown.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(20).max(300),
      description: 'Used in the banner, product cards, search results, and social previews.',
    }),
    defineField({
      name: 'bannerImage',
      title: 'Banner Image',
      type: 'image',
      options: {hotspot: true, accept: 'image/*'},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
      description: 'Upload the main product artwork displayed in the page banner and product listing.',
    }),
    defineField({
      name: 'productUrl',
      title: 'Product / Demo URL',
      type: 'url',
      description: 'Optional destination for the primary banner button.',
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Primary Button Label',
      type: 'string',
      initialValue: 'Explore Product',
      hidden: ({parent}) => !parent?.productUrl,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
      description: 'Lower numbers appear first in the Products dropdown and listing.',
    }),
    defineField({
      name: 'sections',
      title: 'Product Page Sections',
      type: 'array',
      description: 'Add page sections in order. Every section can have its own uploaded image.',
      of: [
        defineArrayMember({
          name: 'productSection',
          title: 'Product Section',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Small Label',
              type: 'string',
              description: 'Optional short label displayed above the section title.',
            }),
            defineField({
              name: 'sectionTitle',
              title: 'Section Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sectionFormat',
              title: 'Section Design',
              type: 'string',
              options: {
                list: [
                  {title: 'Image + Content', value: 'content'},
                  {title: 'Cards / Feature Grid', value: 'cards'},
                  {title: 'Differentiators', value: 'differentiators'},
                  {title: 'Accordion / Expandable List', value: 'accordion'},
                  {title: 'Call To Action', value: 'cta'},
                ],
                layout: 'dropdown',
              },
              initialValue: 'content',
              validation: (Rule) => Rule.required(),
              description: 'Choose the frontend design for this product section.',
            }),
            defineField({
              name: 'intro',
              title: 'Section Introduction',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'body',
              title: 'Section Content',
              type: 'array',
              of: [{type: 'block'}],
              hidden: ({parent}) => Boolean(parent?.sectionFormat && parent.sectionFormat !== 'content'),
            }),
            defineField({
              name: 'items',
              title: 'Cards / Differentiator Items',
              type: 'array',
              hidden: ({parent}) =>
                !['content', 'cards', 'differentiators', 'accordion'].includes(
                  parent?.sectionFormat || 'content',
                ),
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Highlight Title',
                      type: 'string',
                    }),
                    defineField({
                      name: 'description',
                      title: 'Highlight Description',
                      type: 'text',
                      rows: 2,
                    }),
                    defineField({
                      name: 'image',
                      title: 'Card Image',
                      type: 'image',
                      options: {hotspot: true, accept: 'image/*'},
                      fields: [
                        defineField({
                          name: 'alt',
                          title: 'Alternative Text',
                          type: 'string',
                          validation: (Rule) => Rule.required(),
                        }),
                      ],
                      description:
                        'Optional image displayed on this card in the Cards / Feature Grid design.',
                      hidden: ({parent, document}) => {
                        const sections = (document?.sections || []) as Array<{
                          items?: Array<{_key?: string}>
                          sectionFormat?: string
                        }>
                        const containingSection = sections.find((section) =>
                          section.items?.some((item) => item._key === parent?._key),
                        )

                        return containingSection?.sectionFormat !== 'cards'
                      },
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'description',
                      media: 'image',
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'sectionImage',
              title: 'Section Image',
              type: 'image',
              hidden: ({parent}) => parent?.sectionFormat === 'cta',
              options: {hotspot: true, accept: 'image/*'},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alternative Text',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              description: 'Optional image. Images automatically alternate left and right on the website.',
            }),
            defineField({
              name: 'defaultOpenItem',
              title: 'Initially Open Accordion Item',
              type: 'number',
              initialValue: 1,
              hidden: ({parent}) => parent?.sectionFormat !== 'accordion',
              validation: (Rule) => Rule.min(0).integer(),
              description:
                'Enter the item number to open initially, starting from 1. Enter 0 to keep all items closed.',
            }),
            defineField({
              name: 'cta',
              title: 'Call To Action',
              type: 'object',
              hidden: ({parent}) => parent?.sectionFormat !== 'cta',
              fields: [
                defineField({
                  name: 'headline',
                  title: 'CTA Headline',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'description',
                  title: 'CTA Description',
                  type: 'text',
                  rows: 3,
                }),
                defineField({
                  name: 'buttonLabel',
                  title: 'Button Label',
                  type: 'string',
                }),
                defineField({
                  name: 'buttonUrl',
                  title: 'Button URL',
                  type: 'url',
                  hidden: ({parent}) => !parent?.buttonLabel,
                }),
                defineField({
                  name: 'image',
                  title: 'CTA Image',
                  type: 'image',
                  options: {hotspot: true, accept: 'image/*'},
                  fields: [
                    defineField({
                      name: 'alt',
                      title: 'Alternative Text',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'sectionTitle',
              subtitle: 'sectionFormat',
              media: 'sectionImage',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrder',
      by: [
        {field: 'displayOrder', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'bannerImage',
    },
  },
})
