import { defineArrayMember, defineField, defineType } from 'sanity'

export const blogSchema = defineType({
  name: 'blog',
  title: 'Insights',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(100),
      description: 'The insight title (10-100 characters).',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, ''),
      },
      validation: (Rule) => Rule.required(),
      description: 'URL-friendly version of the title.',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(50).max(300),
      description: 'Brief summary of the insight (50-300 characters).',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
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
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Insight Type',
      type: 'string',
      options: {
        list: [
          { title: 'Research & Insights', value: 'research' },
          { title: 'Article', value: 'article' },
          { title: 'Case Study', value: 'case-study' },
        ],
        layout: 'radio',
      },
      initialValue: 'article',
      validation: (Rule) => Rule.required(),
      description: 'Controls which tab this insight appears under on the website.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Food & Beverages', value: 'food-beverages' },
          { title: 'Personal Care & Beauty', value: 'personal-care-beauty' },
          { title: 'Home Care', value: 'home-care' },
          { title: 'Health & Wellness', value: 'health-wellness' },
          { title: 'Baby & Family Care', value: 'baby-family-care' },
          { title: 'Consumer Electronics', value: 'consumer-electronics' },
          { title: 'Mobile Accessories', value: 'mobile-accessories' },
          { title: 'Electricals & Lighting', value: 'electricals-lighting' },
          { title: 'Consumer Durables', value: 'consumer-durables' },
          { title: 'Building Materials', value: 'building-materials' },
          { title: 'Home Improvement & Decor', value: 'home-improvement-decor' },
          { title: 'Fashion & Lifestyle', value: 'fashion-lifestyle' },
          { title: 'Automotive Aftermarket', value: 'automotive-aftermarket' },
          { title: 'Packaging', value: 'packaging' },
          { title: 'Pet Care', value: 'pet-care' },
          { title: 'Sustainable Products', value: 'sustainable-products' },
          { title: 'Retail & E-Commerce', value: 'retail-e-commerce' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'capability',
      title: 'Capability',
      type: 'reference',
      to: [{ type: 'capabilities' }],
      description: 'Connect this insight to a capability so it appears on that capability detail page.',
    }),
    defineField({
      name: 'experts',
      title: 'Experts',
      type: 'array',
      description: 'Select one or more mentors to show at the end of this insight.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'mentor' }],
          options: {
            disableNew: true,
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Estimated reading time, for example "5 min read".',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          options: {
            layout: 'tags',
          },
        }),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) => Rule.required(),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: true,
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
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
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
            defineField({
              name: 'size',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  { title: 'Small', value: 'small' },
                  { title: 'Medium', value: 'medium' },
                  { title: 'Large', value: 'large' },
                  { title: 'Full Width', value: 'full' },
                ],
              },
              initialValue: 'medium',
            }),
          ],
        }),
        defineArrayMember({
          name: 'codeBlock',
          type: 'object',
          fields: [
            defineField({
              name: 'language',
              title: 'Language',
              type: 'string',
              options: {
                list: [
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'Python', value: 'python' },
                  { title: 'HTML', value: 'html' },
                  { title: 'CSS', value: 'css' },
                  { title: 'JSON', value: 'json' },
                  { title: 'Bash', value: 'bash' },
                  { title: 'Other', value: 'other' },
                ],
              },
              initialValue: 'javascript',
            }),
            defineField({
              name: 'code',
              title: 'Code',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'filename',
              title: 'Filename (optional)',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              language: 'language',
              code: 'code',
            },
            prepare({ language, code }) {
              return {
                title: `${language} Code Block`,
                subtitle: code ? `${code.slice(0, 50)}${code.length > 50 ? '...' : ''}` : '',
              }
            },
          },
        }),
        defineArrayMember({
          name: 'cta',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Button Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Secondary', value: 'secondary' },
                  { title: 'Outline', value: 'outline' },
                ],
              },
              initialValue: 'primary',
            }),
          ],
          preview: {
            select: {
              text: 'text',
              url: 'url',
              style: 'style',
            },
            prepare({ text, url, style }) {
              return {
                title: `CTA: ${text}`,
                subtitle: `${url} (${style})`,
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      publishedAt: 'publishedAt',
      category: 'category',
      capability: 'capability.title',
    },
    prepare({ title, media, publishedAt, category, capability }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
      return {
        title,
        subtitle: [category, capability, date].filter(Boolean).join(' - '),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Published Date (Newest First)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date (Oldest First)',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Title (Z-A)',
      name: 'titleDesc',
      by: [{ field: 'title', direction: 'desc' }],
    },
  ],
})
