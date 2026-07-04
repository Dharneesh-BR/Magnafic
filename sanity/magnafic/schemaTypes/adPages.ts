import {defineArrayMember, defineField, defineType} from 'sanity'

const mediaFields = [
  defineField({
    name: 'mediaType',
    title: 'Media Type',
    type: 'string',
    options: {
      list: [
        {title: 'Image', value: 'image'},
        {title: 'Video URL', value: 'video-url'},
        {title: 'Uploaded Video', value: 'video-file'},
      ],
      layout: 'radio',
    },
    initialValue: 'image',
  }),
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    options: {hotspot: true, accept: 'image/*'},
    hidden: ({parent}) => parent?.mediaType && parent.mediaType !== 'image',
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative Text',
        type: 'string',
      }),
    ],
  }),
  defineField({
    name: 'videoUrl',
    title: 'Video URL',
    type: 'url',
    hidden: ({parent}) => parent?.mediaType !== 'video-url',
    description: 'Use YouTube, Vimeo, Loom, or any public hosted video URL.',
  }),
  defineField({
    name: 'videoFile',
    title: 'Uploaded Video',
    type: 'file',
    options: {accept: 'video/*'},
    hidden: ({parent}) => parent?.mediaType !== 'video-file',
  }),
  defineField({
    name: 'caption',
    title: 'Caption',
    type: 'string',
  }),
]

const mediaObject = defineField({
  name: 'media',
  title: 'Section Media',
  type: 'object',
  description: 'Optional image or video for this section.',
  fields: mediaFields,
})

const itemMediaObject = defineField({
  name: 'media',
  title: 'Item Media',
  type: 'object',
  description: 'Optional image or video for this individual item.',
  fields: mediaFields,
})

const ctaActionFields = [
  defineField({
    name: 'buttonAction',
    title: 'Button Action',
    type: 'string',
    options: {
      list: [
        {title: 'External / Internal Link', value: 'link'},
        {title: 'Razorpay Checkout', value: 'razorpay'},
        {title: 'Open Form', value: 'form'},
      ],
      layout: 'radio',
    },
    initialValue: 'link',
  }),
  defineField({
    name: 'buttonUrl',
    title: 'Button URL',
    type: 'url',
    hidden: ({parent}) => (parent?.buttonAction || 'link') !== 'link',
  }),
  defineField({
    name: 'razorpayAmount',
    title: 'Razorpay Amount',
    type: 'number',
    description: 'Amount in rupees, for example 99 or 499.',
    hidden: ({parent}) => parent?.buttonAction !== 'razorpay',
    validation: (Rule) => Rule.min(1),
  }),
  defineField({
    name: 'razorpayDescription',
    title: 'Razorpay Description',
    type: 'string',
    description: 'Shown in Razorpay checkout and stored with the payment.',
    hidden: ({parent}) => parent?.buttonAction !== 'razorpay',
  }),
  defineField({
    name: 'formTitle',
    title: 'Form Title',
    type: 'string',
    hidden: ({parent}) => parent?.buttonAction !== 'form',
  }),
  defineField({
    name: 'formDescription',
    title: 'Form Description',
    type: 'text',
    rows: 3,
    hidden: ({parent}) => parent?.buttonAction !== 'form',
  }),
  defineField({
    name: 'formButtonLabel',
    title: 'Form Submit Button Label',
    type: 'string',
    hidden: ({parent}) => parent?.buttonAction !== 'form',
  }),
  defineField({
    name: 'showMessageField',
    title: 'Show Message Field',
    type: 'boolean',
    initialValue: true,
    hidden: ({parent}) => parent?.buttonAction !== 'form',
  }),
]

const confirmationEmailObject = defineField({
  name: 'confirmationEmail',
  title: 'Confirmation Email Content',
  type: 'object',
  description: 'Optional email sent to the visitor after this action is completed. Supports {{First Name}}, {{Name}}, {{Email}}, {{Contact No}}, {{Program}}, {{Amount}}, {{Payment ID}}, {{Page Title}}, and {{Action}}.',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Send Confirmation Email',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'subject',
      title: 'Email Subject',
      type: 'string',
      hidden: ({parent}) => !parent?.enabled,
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: 'fromName',
      title: 'Sender Name',
      type: 'string',
      initialValue: 'Magnafic',
      hidden: ({parent}) => !parent?.enabled,
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'body',
      title: 'Email Body',
      type: 'text',
      rows: 12,
      hidden: ({parent}) => !parent?.enabled,
      description: 'Plain text email body. Line breaks are preserved in the email.',
    }),
  ],
})

const workshopDetailIcons = [
  {title: 'Calendar', value: 'calendar'},
  {title: 'Language', value: 'language'},
  {title: 'Clock', value: 'clock'},
  {title: 'Video / Zoom', value: 'video'},
  {title: 'Custom / Info', value: 'info'},
]

export const adPagesSchema = defineType({
  name: 'adPages',
  title: 'Ad Pages',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Ad Page Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(140),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
      description: 'Direct URL will be /ads/your-slug. Ad pages are not added to website navigation.',
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
    defineField({
      name: 'headline',
      title: 'Hero Headline',
      type: 'string',
      validation: (Rule) => Rule.required().min(8).max(180),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Hero Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(360),
    }),
    defineField({
      name: 'primaryButtonLabel',
      title: 'Primary Button Label',
      type: 'string',
    }),
    defineField({
      name: 'primaryButtonAction',
      title: 'Primary Button Action',
      type: 'string',
      options: {
        list: [
          {title: 'External / Internal Link', value: 'link'},
          {title: 'Razorpay Checkout', value: 'razorpay'},
          {title: 'Open Form', value: 'form'},
        ],
        layout: 'radio',
      },
      initialValue: 'link',
      hidden: ({parent}) => !parent?.primaryButtonLabel,
    }),
    defineField({
      name: 'primaryButtonUrl',
      title: 'Primary Button URL',
      type: 'url',
      hidden: ({parent}) => !parent?.primaryButtonLabel || (parent?.primaryButtonAction || 'link') !== 'link',
    }),
    defineField({
      name: 'primaryRazorpayAmount',
      title: 'Primary Razorpay Amount',
      type: 'number',
      description: 'Amount in rupees, for example 99 or 499.',
      hidden: ({parent}) => !parent?.primaryButtonLabel || parent?.primaryButtonAction !== 'razorpay',
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'primaryRazorpayDescription',
      title: 'Primary Razorpay Description',
      type: 'string',
      hidden: ({parent}) => !parent?.primaryButtonLabel || parent?.primaryButtonAction !== 'razorpay',
    }),
    defineField({
      name: 'primaryFormTitle',
      title: 'Primary Form Title',
      type: 'string',
      hidden: ({parent}) => !parent?.primaryButtonLabel || parent?.primaryButtonAction !== 'form',
    }),
    defineField({
      name: 'primaryFormDescription',
      title: 'Primary Form Description',
      type: 'text',
      rows: 3,
      hidden: ({parent}) => !parent?.primaryButtonLabel || parent?.primaryButtonAction !== 'form',
    }),
    defineField({
      name: 'primaryFormButtonLabel',
      title: 'Primary Form Submit Button Label',
      type: 'string',
      hidden: ({parent}) => !parent?.primaryButtonLabel || parent?.primaryButtonAction !== 'form',
    }),
    defineField({
      ...confirmationEmailObject,
      name: 'primaryConfirmationEmail',
      title: 'Primary Action Confirmation Email',
      hidden: ({parent}) => !parent?.primaryButtonLabel,
    }),
    defineField({
      name: 'secondaryButtonLabel',
      title: 'Secondary Button Label',
      type: 'string',
    }),
    defineField({
      name: 'secondaryButtonUrl',
      title: 'Secondary Button URL',
      type: 'url',
      hidden: ({parent}) => !parent?.secondaryButtonLabel,
    }),
    defineField({
      name: 'heroMedia',
      title: 'Hero Media',
      type: 'object',
      description: 'Optional hero image or video.',
      fields: mediaFields,
    }),
    defineField({
      name: 'workshopDetails',
      title: 'Hero Workshop Detail Cards',
      type: 'array',
      description:
        'Cards shown below the hero description in the live masterclass-style design, for example date, language, time, and Zoom details.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {list: workshopDetailIcons, layout: 'dropdown'},
              initialValue: 'info',
            }),
            defineField({
              name: 'label',
              title: 'Detail Text',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'icon'},
          },
        }),
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'stickyRegistrationBar',
      title: 'Sticky Registration Bar',
      type: 'object',
      description: 'Bottom fixed registration bar used in the masterclass-style design.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Sticky Bar',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'buttonLabel',
          title: 'Sticky Button Label',
          type: 'string',
          description: 'Optional. Leave blank to use the primary button label.',
          hidden: ({parent}) => parent?.enabled === false,
        }),
        defineField({
          name: 'countdownMinutes',
          title: 'Sticky Countdown Duration (Minutes)',
          type: 'number',
          description:
            'Optional. Leave blank to use the first CTA timer. The timer starts again whenever the page is refreshed.',
          hidden: ({parent}) => parent?.enabled === false,
          validation: (Rule) => Rule.min(1),
        }),
        defineField({
          name: 'countdownLabel',
          title: 'Sticky Countdown Label',
          type: 'string',
          description: 'Optional. Example: "left".',
          hidden: ({parent}) => parent?.enabled === false || !parent?.countdownMinutes,
        }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Page Theme',
      type: 'string',
      options: {
        list: [
          {title: 'Dark Blue', value: 'dark'},
          {title: 'Light', value: 'light'},
          {title: 'Gradient', value: 'gradient'},
        ],
        layout: 'radio',
      },
      initialValue: 'dark',
    }),
    defineField({
      name: 'sections',
      title: 'Ad Page Sections',
      type: 'array',
      description: 'Create flexible ad page sections. Every section and item can include image or video media.',
      of: [
        defineArrayMember({
          name: 'adPageSection',
          title: 'Ad Page Section',
          type: 'object',
          fields: [
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
                  {title: 'Image / Video + Content', value: 'content'},
                  {title: 'Rich Text', value: 'rich-text'},
                  {title: 'Simple List', value: 'list'},
                  {title: 'Cards / Feature Grid', value: 'cards'},
                  {title: 'Differentiators', value: 'differentiators'},
                  {title: 'Accordion / Expandable List', value: 'accordion'},
                  {title: 'Curriculum / Modules', value: 'curriculum'},
                  {title: 'Timeline / Agenda', value: 'timeline'},
                  {title: 'FAQs', value: 'faqs'},
                  {title: 'Outcomes', value: 'outcomes'},
                  {title: 'Testimonials', value: 'testimonials'},
                  {title: 'Stats / Metrics', value: 'stats'},
                  {title: 'Media Gallery', value: 'media-gallery'},
                  {title: 'Call To Action', value: 'cta'},
                ],
                layout: 'dropdown',
              },
              initialValue: 'content',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'intro',
              title: 'Section Introduction',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'body',
              title: 'Rich Text Body',
              type: 'array',
              of: [{type: 'block'}],
              hidden: ({parent}) => !['content', 'rich-text'].includes(parent?.sectionFormat || 'content'),
            }),
            mediaObject,
            defineField({
              name: 'items',
              title: 'List / Card / Outcome / Stat Items',
              type: 'array',
              hidden: ({parent}) =>
                !['content', 'list', 'cards', 'differentiators', 'accordion', 'outcomes', 'stats', 'media-gallery'].includes(
                  parent?.sectionFormat || 'content',
                ),
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'title', title: 'Item Title', type: 'string'}),
                    defineField({name: 'description', title: 'Item Description', type: 'text', rows: 3}),
                    defineField({
                      name: 'metric',
                      title: 'Metric / Number',
                      type: 'string',
                      hidden: ({document, parent}) => {
                        const sections = ((document as {sections?: Array<{items?: Array<{_key?: string}>, sectionFormat?: string}>})?.sections || [])
                        return sections.find((section) => section.items?.some((item) => item._key === parent?._key))?.sectionFormat !== 'stats'
                      },
                    }),
                    defineField({name: 'iconLabel', title: 'Icon Label', type: 'string'}),
                    itemMediaObject,
                  ],
                  preview: {
                    select: {title: 'title', subtitle: 'description', media: 'media.image'},
                  },
                }),
              ],
            }),
            defineField({
              name: 'modules',
              title: 'Curriculum Modules',
              type: 'array',
              hidden: ({parent}) => parent?.sectionFormat !== 'curriculum',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'title', title: 'Module Title', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'description', title: 'Module Description', type: 'text', rows: 3}),
                    defineField({name: 'lessons', title: 'Lessons / Topics', type: 'array', of: [{type: 'string'}]}),
                    itemMediaObject,
                  ],
                }),
              ],
            }),
            defineField({
              name: 'timeline',
              title: 'Timeline / Agenda Items',
              type: 'array',
              hidden: ({parent}) => parent?.sectionFormat !== 'timeline',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'timeLabel', title: 'Time / Step Label', type: 'string'}),
                    defineField({name: 'title', title: 'Agenda Title', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'description', title: 'Agenda Description', type: 'text', rows: 3}),
                    itemMediaObject,
                  ],
                }),
              ],
            }),
            defineField({
              name: 'faqs',
              title: 'FAQs',
              type: 'array',
              hidden: ({parent}) => parent?.sectionFormat !== 'faqs',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (Rule) => Rule.required()}),
                    itemMediaObject,
                  ],
                }),
              ],
            }),
            defineField({
              name: 'testimonials',
              title: 'Testimonials',
              type: 'array',
              hidden: ({parent}) => parent?.sectionFormat !== 'testimonials',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required()}),
                    defineField({name: 'name', title: 'Name', type: 'string'}),
                    defineField({name: 'designation', title: 'Designation / Company', type: 'string'}),
                    itemMediaObject,
                  ],
                }),
              ],
            }),
            defineField({
              name: 'cta',
              title: 'Call To Action',
              type: 'object',
              hidden: ({parent}) => parent?.sectionFormat !== 'cta',
              fields: [
                defineField({name: 'headline', title: 'CTA Headline', type: 'string'}),
                defineField({name: 'description', title: 'CTA Description', type: 'text', rows: 3}),
                defineField({
                  name: 'countdownMinutes',
                  title: 'Countdown Duration (Minutes)',
                  type: 'number',
                  description: 'Optional. If set, the CTA shows a countdown timer that starts from this duration every time the page is loaded or refreshed.',
                  validation: (Rule) => Rule.min(1),
                }),
                defineField({
                  name: 'countdownLabel',
                  title: 'Countdown Label',
                  type: 'string',
                  description: 'Optional label shown above the timer, for example "Offer ends in".',
                  hidden: ({parent}) => !parent?.countdownMinutes,
                }),
                defineField({name: 'buttonLabel', title: 'Button Label', type: 'string'}),
                ...ctaActionFields,
                confirmationEmailObject,
              ],
            }),
          ],
          preview: {
            select: {title: 'sectionTitle', subtitle: 'sectionFormat', media: 'media.image'},
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
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'heroMedia.image',
    },
  },
})
