import { defineArrayMember, defineField, defineType } from 'sanity'

export const programsSchema = defineType({
  name: 'programs',
  title: 'Programs',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Program Title',
      type: 'string',
      description: 'Name of the program, course, live session, online session, or meetup.',
      validation: (Rule) => Rule.required().min(5).max(120),
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
      description: 'URL-friendly version of the program title.',
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
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
      description: 'Use Published when this program should be shown on the website.',
    }),
    defineField({
      name: 'programType',
      title: 'Program Type',
      type: 'string',
      options: {
        list: [
          { title: 'Live Session', value: 'live-session' },
          { title: 'Online Session', value: 'online-session' },
          { title: 'Meetup', value: 'meetup' },
          { title: 'Course', value: 'course' },
          { title: 'Workshop', value: 'workshop' },
          { title: 'Masterclass', value: 'masterclass' },
          { title: 'Cohort Program', value: 'cohort-program' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      description: 'Choose the broad type of experience this program represents.',
    }),
    defineField({
      name: 'deliveryMode',
      title: 'Delivery Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Online', value: 'online' },
          { title: 'Offline', value: 'offline' },
          { title: 'Hybrid', value: 'hybrid' },
          { title: 'Self-paced', value: 'self-paced' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      description: 'How participants will attend or consume the program.',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(40).max(280),
      description: 'Brief summary for cards, listings, and share previews.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
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
      ],
      description: 'Main image used on the program page and listing cards.',
    }),
    defineField({
      name: 'mentors',
      title: 'Mentors',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'mentor' }],
          options: {
            disableNew: true,
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).unique(),
      description: 'Select one or more mentors conducting this program.',
    }),
    defineField({
      name: 'capabilities',
      title: 'Related Capabilities',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'capabilities' }],
        }),
      ],
      validation: (Rule) => Rule.unique(),
      description: 'Optional capabilities or business themes connected to this program.',
    }),
    defineField({
      name: 'audience',
      title: 'Ideal Audience',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Who should attend, for example founders, CXOs, sales leaders, or brand teams.',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'Start date and time for live, online, meetup, workshop, or cohort programs.',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'End date and time, if the program has one.',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Readable duration, for example 90 minutes, 2 days, 6 weeks, or self-paced.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      hidden: ({ parent }) => parent?.deliveryMode === 'online' || parent?.deliveryMode === 'self-paced',
      description: 'Venue, city, or meetup location for offline or hybrid programs.',
    }),
    defineField({
      name: 'onlineLink',
      title: 'Online Link',
      type: 'url',
      hidden: ({ parent }) => parent?.deliveryMode === 'offline',
      description: 'Meeting link, course link, or registration destination for online access.',
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration URL',
      type: 'url',
      description: 'External registration or payment link, if applicable.',
    }),
    defineField({
      name: 'pricingType',
      title: 'Pricing Type',
      type: 'string',
      options: {
        list: [
          { title: 'Paid', value: 'paid' },
          { title: 'Free', value: 'free' },
          { title: 'Contact Us', value: 'contact' },
          { title: 'Invite-only', value: 'invite-only' },
        ],
        layout: 'radio',
      },
      initialValue: 'paid',
      description: 'Choose how the program price should be presented.',
    }),
    defineField({
      name: 'pricingOptions',
      title: 'Prices & Discounts',
      type: 'array',
      hidden: ({ parent }) => parent?.pricingType !== 'paid',
      description: 'Add one or more currency options. Each currency can have its own price and discount.',
      validation: (Rule) => Rule.unique(),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'programPrice',
          title: 'Currency Price',
          fields: [
            defineField({
              name: 'currency',
              title: 'Currency',
              type: 'string',
              options: {
                list: [
                  { title: 'Indian Rupee (INR)', value: 'INR' },
                  { title: 'US Dollar (USD)', value: 'USD' },
                  { title: 'Euro (EUR)', value: 'EUR' },
                  { title: 'British Pound (GBP)', value: 'GBP' },
                  { title: 'UAE Dirham (AED)', value: 'AED' },
                  { title: 'Singapore Dollar (SGD)', value: 'SGD' },
                  { title: 'Australian Dollar (AUD)', value: 'AUD' },
                  { title: 'Canadian Dollar (CAD)', value: 'CAD' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Regular Price',
              type: 'number',
              validation: (Rule) => Rule.required().min(0).precision(2),
              description: 'Enter the regular price before discount.',
            }),
            defineField({
              name: 'discountType',
              title: 'Discount Type',
              type: 'string',
              options: {
                list: [
                  { title: 'No Discount', value: 'none' },
                  { title: 'Percentage Discount', value: 'percentage' },
                  { title: 'Fixed Amount Discount', value: 'fixed' },
                ],
                layout: 'radio',
              },
              initialValue: 'none',
            }),
            defineField({
              name: 'discountValue',
              title: 'Discount Value',
              type: 'number',
              hidden: ({ parent }) => !parent?.discountType || parent?.discountType === 'none',
              description: 'Enter the percentage or fixed discount amount based on the selected discount type.',
              validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as {
                  discountType?: string
                  price?: number
                }

                if (!parent?.discountType || parent.discountType === 'none') return true
                if (value === undefined || value === null) return 'Discount value is required.'
                if (value < 0) return 'Discount cannot be negative.'
                if (parent.discountType === 'percentage' && value > 100) {
                  return 'Percentage discount cannot exceed 100%.'
                }
                if (parent.discountType === 'fixed' && parent.price !== undefined && value > parent.price) {
                  return 'Fixed discount cannot exceed the regular price.'
                }
                return true
              }),
            }),
            defineField({
              name: 'label',
              title: 'Optional Price Label',
              type: 'string',
              description: 'Example: Early Bird, Founder Offer, or Limited-time Price.',
            }),
          ],
          preview: {
            select: {
              currency: 'currency',
              price: 'price',
              discountType: 'discountType',
              discountValue: 'discountValue',
              label: 'label',
            },
            prepare({ currency, price, discountType, discountValue, label }) {
              const regularPrice = `${currency || ''} ${price ?? 0}`.trim()
              const discount = discountType === 'percentage'
                ? `${discountValue || 0}% off`
                : discountType === 'fixed'
                  ? `${currency || ''} ${discountValue || 0} off`
                  : 'No discount'

              return {
                title: label || regularPrice,
                subtitle: `${regularPrice} | ${discount}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Legacy Display Price',
      type: 'string',
      description: 'Existing display price used by older programs. Use Prices & Discounts for new entries.',
    }),
    defineField({
      name: 'seats',
      title: 'Seats / Capacity',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
      description: 'Optional maximum number of participants.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Program',
      type: 'boolean',
      initialValue: false,
      description: 'Mark this if the program should appear prominently.',
    }),
    defineField({
      name: 'sections',
      title: 'Program Page Sections',
      type: 'array',
      description: 'Create flexible sections. Each section has a title and a selected presentation format.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'programSection',
          title: 'Program Section',
          fields: [
            defineField({
              name: 'sectionTitle',
              title: 'Section Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Heading for this section, such as What You Will Learn or Why This Program.',
            }),
            defineField({
              name: 'sectionFormat',
              title: 'Section Format',
              type: 'string',
              options: {
                list: [
                  { title: 'Rich Text', value: 'rich-text' },
                  { title: 'Simple List', value: 'list' },
                  { title: 'Differentiators', value: 'differentiators' },
                  { title: 'Cards / Feature Grid', value: 'cards' },
                  { title: 'Curriculum / Modules', value: 'curriculum' },
                  { title: 'Timeline / Agenda', value: 'timeline' },
                  { title: 'FAQs', value: 'faqs' },
                  { title: 'Outcomes', value: 'outcomes' },
                  { title: 'Testimonials', value: 'testimonials' },
                  { title: 'Call To Action', value: 'cta' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'rich-text',
              validation: (Rule) => Rule.required(),
              description: 'Choose how this section should be interpreted and displayed.',
            }),
            defineField({
              name: 'intro',
              title: 'Section Intro',
              type: 'text',
              rows: 3,
              description: 'Optional short paragraph shown below the section title.',
            }),
            defineField({
              name: 'body',
              title: 'Rich Text Body',
              type: 'array',
              of: [{ type: 'block' }],
              hidden: ({ parent }) => parent?.sectionFormat !== 'rich-text',
              description: 'Use this when the section is mostly explanatory content.',
            }),
            defineField({
              name: 'items',
              title: 'List / Differentiator / Card Items',
              type: 'array',
              hidden: ({ parent }) =>
                !['list', 'differentiators', 'cards', 'outcomes'].includes(parent?.sectionFormat),
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Item Title',
                      type: 'string',
                    }),
                    defineField({
                      name: 'description',
                      title: 'Item Description',
                      type: 'text',
                      rows: 3,
                    }),
                    defineField({
                      name: 'iconLabel',
                      title: 'Icon Label',
                      type: 'string',
                      description: 'Optional icon keyword or short label for the frontend.',
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'description',
                    },
                  },
                }),
              ],
              description: 'Reusable items for lists, differentiators, feature cards, or outcomes.',
            }),
            defineField({
              name: 'modules',
              title: 'Curriculum Modules',
              type: 'array',
              hidden: ({ parent }) => parent?.sectionFormat !== 'curriculum',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Module Title',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'description',
                      title: 'Module Description',
                      type: 'text',
                      rows: 3,
                    }),
                    defineField({
                      name: 'lessons',
                      title: 'Lessons / Topics',
                      type: 'array',
                      of: [{ type: 'string' }],
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'description',
                    },
                  },
                }),
              ],
              description: 'Use for course modules, class flow, or learning blocks.',
            }),
            defineField({
              name: 'timeline',
              title: 'Timeline / Agenda Items',
              type: 'array',
              hidden: ({ parent }) => parent?.sectionFormat !== 'timeline',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'timeLabel',
                      title: 'Time / Step Label',
                      type: 'string',
                      description: 'Example: 10:00 AM, Week 1, Day 2, or Step 01.',
                    }),
                    defineField({
                      name: 'title',
                      title: 'Agenda Title',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'description',
                      title: 'Agenda Description',
                      type: 'text',
                      rows: 3,
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'timeLabel',
                    },
                  },
                }),
              ],
              description: 'Use for live agendas, session schedules, or step-by-step journeys.',
            }),
            defineField({
              name: 'faqs',
              title: 'FAQs',
              type: 'array',
              hidden: ({ parent }) => parent?.sectionFormat !== 'faqs',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'question',
                      title: 'Question',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'answer',
                      title: 'Answer',
                      type: 'text',
                      rows: 4,
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'question',
                      subtitle: 'answer',
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'testimonials',
              title: 'Testimonials',
              type: 'array',
              hidden: ({ parent }) => parent?.sectionFormat !== 'testimonials',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'quote',
                      title: 'Quote',
                      type: 'text',
                      rows: 4,
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'name',
                      title: 'Name',
                      type: 'string',
                    }),
                    defineField({
                      name: 'designation',
                      title: 'Designation / Company',
                      type: 'string',
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'name',
                      subtitle: 'quote',
                    },
                    prepare({ title, subtitle }) {
                      return {
                        title: title || 'Testimonial',
                        subtitle,
                      }
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'cta',
              title: 'Call To Action',
              type: 'object',
              hidden: ({ parent }) => parent?.sectionFormat !== 'cta',
              fields: [
                defineField({
                  name: 'headline',
                  title: 'CTA Headline',
                  type: 'string',
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
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'sectionTitle',
              subtitle: 'sectionFormat',
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
      description: 'Optional title for search and social previews.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160),
      description: 'Optional description for search and social previews.',
    }),
  ],
  orderings: [
    {
      title: 'Start Date, Newest First',
      name: 'startDateDesc',
      by: [{ field: 'startDate', direction: 'desc' }],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'startDate', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'programType',
      media: 'heroImage',
      startDate: 'startDate',
    },
    prepare({ title, subtitle, media, startDate }) {
      const date = startDate ? new Date(startDate).toLocaleDateString() : 'No date'

      return {
        title,
        subtitle: [subtitle, date].filter(Boolean).join(' - '),
        media,
      }
    },
  },
})
