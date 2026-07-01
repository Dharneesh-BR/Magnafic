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
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'LinkedIn-style professional headline shown under the mentor name.',
    }),
    defineField({
      name: 'email',
      title: 'Email ID',
      type: 'string',
      description: 'Private. Used only for consultant email notifications and not displayed on the website.',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          name: 'email',
          invert: false,
        }).warning('Enter a valid email address.'),
    }),
    defineField({
      name: 'contactNo',
      title: 'Contact Number',
      type: 'string',
      description: 'Private. Used only for internal consultant communication and not displayed on the website.',
    }),
    defineField({
      name: 'receiveNotifications',
      title: 'Receive Email Notifications',
      type: 'boolean',
      initialValue: true,
      description: 'Turn off only if this consultant should not receive automated notification emails.',
    }),
    defineField({
      name: 'mouDocuments',
      title: 'MOU Documents',
      type: 'array',
      description: 'Track MOU documents, signing status, signed PDFs, and audit history directly on this mentor profile.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'pdfFile',
              title: 'PDF File',
              type: 'file',
              options: {
                accept: 'application/pdf',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'status',
              title: 'Status',
              type: 'string',
              initialValue: 'pending',
              options: {
                list: [
                  { title: 'Pending', value: 'pending' },
                  { title: 'Signed', value: 'signed' },
                  { title: 'Expired', value: 'expired' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'signedPdf',
              title: 'Signed PDF URL',
              type: 'url',
              description: 'Automatically populated after the consultant signs.',
            }),
            defineField({
              name: 'signedAt',
              title: 'Signed At',
              type: 'datetime',
            }),
            defineField({
              name: 'version',
              title: 'Version',
              type: 'string',
              initialValue: '1.0',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'auditTrail',
              title: 'Audit Trail',
              type: 'array',
              readOnly: true,
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'consultantId', title: 'Consultant ID', type: 'string' }),
                    defineField({ name: 'consultantName', title: 'Consultant Name', type: 'string' }),
                    defineField({ name: 'documentId', title: 'Document ID', type: 'string' }),
                    defineField({ name: 'signedAt', title: 'Signed At', type: 'datetime' }),
                    defineField({ name: 'documentVersion', title: 'Document Version', type: 'string' }),
                    defineField({ name: 'signatureImageUrl', title: 'Signature Image URL', type: 'url' }),
                  ],
                  preview: {
                    select: {
                      title: 'consultantName',
                      signedAt: 'signedAt',
                      version: 'documentVersion',
                    },
                    prepare({ title, signedAt, version }) {
                      return {
                        title: title || 'Signature event',
                        subtitle: [signedAt, version ? `Version ${version}` : ''].filter(Boolean).join(' | '),
                      }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              status: 'status',
              version: 'version',
            },
            prepare({ title, status, version }) {
              return {
                title: title || 'MOU Document',
                subtitle: [status, version ? `v${version}` : ''].filter(Boolean).join(' | '),
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'invoices',
      title: 'Invoices',
      type: 'array',
      description: 'Track consultant invoices directly on this mentor profile.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'invoiceDate',
              title: 'Invoice Date',
              type: 'date',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'amount',
              title: 'Amount',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'pdfFile',
              title: 'PDF File',
              type: 'file',
              options: {
                accept: 'application/pdf',
              },
              description: 'Upload the invoice PDF for this invoice.',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              description: 'Short note about what this invoice covers.',
              validation: (Rule) => Rule.max(240).warning('Keep the invoice description brief.'),
            }),
          ],
          preview: {
            select: {
              date: 'invoiceDate',
              amount: 'amount',
              description: 'description',
            },
            prepare({ date, amount, description }) {
              const formattedAmount =
                typeof amount === 'number'
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(amount)
                  : 'Amount not set'

              return {
                title: [date, formattedAmount].filter(Boolean).join(' | ') || 'Invoice',
                subtitle: description || 'No description',
              }
            },
          },
        },
      ],
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
      name: 'bannerImage',
      title: 'Banner Image',
      type: 'image',
      description: 'Wide cover image for the mentor profile header.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'currentDesignation',
      title: 'Current Designation',
      type: 'string',
    }),
    defineField({
      name: 'currentCompany',
      title: 'Current Company',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'availabilityStatus',
      title: 'Availability Status',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Limited Availability', value: 'limited' },
          { title: 'Unavailable', value: 'unavailable' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profileIntro',
      title: 'Profile Intro',
      type: 'text',
      rows: 4,
      description: 'Brief intro for the top profile card.',
    }),
    defineField({
      name: 'totalYearsOfExperience',
      title: 'Total Years Of Experience',
      type: 'number',
      description: 'Overall years of professional experience, for example 18.',
      validation: (Rule) => Rule.min(0).precision(1),
    }),
    defineField({
      name: 'about',
      title: 'About',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'experience',
      title: 'Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'roleTitle',
              title: 'Role Title',
              type: 'string',
            }),
            defineField({
              name: 'companyName',
              title: 'Company Name',
              type: 'string',
            }),
            defineField({
              name: 'companyLogo',
              title: 'Company Logo',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'employmentType',
              title: 'Employment Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Full-time', value: 'full-time' },
                  { title: 'Part-time', value: 'part-time' },
                  { title: 'Contract', value: 'contract' },
                  { title: 'Freelance', value: 'freelance' },
                  { title: 'Consulting', value: 'consulting' },
                  { title: 'Advisory', value: 'advisory' },
                ],
              },
            }),
            defineField({
              name: 'location',
              title: 'Location',
              type: 'string',
            }),
            defineField({
              name: 'startDate',
              title: 'Start Date',
              type: 'date',
            }),
            defineField({
              name: 'endDate',
              title: 'End Date',
              type: 'date',
              hidden: ({ parent }) => Boolean(parent?.currentlyWorkingHere),
            }),
            defineField({
              name: 'currentlyWorkingHere',
              title: 'Currently Working Here',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              name: 'skillsUsed',
              title: 'Skills Used',
              type: 'array',
              of: [{ type: 'string' }],
            }),
          ],
          preview: {
            select: {
              title: 'roleTitle',
              subtitle: 'companyName',
              media: 'companyLogo',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'schoolName',
              title: 'School Name',
              type: 'string',
            }),
            defineField({
              name: 'schoolLogo',
              title: 'School Logo',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'degree',
              title: 'Degree',
              type: 'string',
            }),
            defineField({
              name: 'fieldOfStudy',
              title: 'Field Of Study',
              type: 'string',
            }),
            defineField({
              name: 'startDate',
              title: 'Start Date',
              type: 'date',
            }),
            defineField({
              name: 'endDate',
              title: 'End Date',
              type: 'date',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: {
              title: 'schoolName',
              subtitle: 'degree',
              media: 'schoolLogo',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'certifications',
      title: 'Licenses & Certifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'certificationName',
              title: 'Certification Name',
              type: 'string',
            }),
            defineField({
              name: 'issuingOrganization',
              title: 'Issuing Organization',
              type: 'string',
            }),
            defineField({
              name: 'organizationLogo',
              title: 'Organization Logo',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'issueDate',
              title: 'Issue Date',
              type: 'date',
            }),
            defineField({
              name: 'expirationDate',
              title: 'Expiration Date',
              type: 'date',
            }),
            defineField({
              name: 'credentialId',
              title: 'Credential ID',
              type: 'string',
            }),
            defineField({
              name: 'credentialUrl',
              title: 'Credential URL',
              type: 'url',
            }),
          ],
          preview: {
            select: {
              title: 'certificationName',
              subtitle: 'issuingOrganization',
              media: 'organizationLogo',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'keySkills',
      title: 'Key Skills',
      type: 'array',
      description: 'Primary skills shown on the expert profile.',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'featuredItems',
      title: 'Featured',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'thumbnailImage',
              title: 'Thumbnail Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'url',
            }),
            defineField({
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Article', value: 'article' },
                  { title: 'Video', value: 'video' },
                  { title: 'Document', value: 'document' },
                  { title: 'Website', value: 'website' },
                  { title: 'Case Study', value: 'case-study' },
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'type',
              media: 'thumbnailImage',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'projects',
      title: 'Projects / Case Studies',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'projectTitle',
              title: 'Project Title',
              type: 'string',
            }),
            defineField({
              name: 'projectImage',
              title: 'Project Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'clientOrCompany',
              title: 'Client Or Company',
              type: 'string',
            }),
            defineField({
              name: 'startDate',
              title: 'Start Date',
              type: 'date',
            }),
            defineField({
              name: 'endDate',
              title: 'End Date',
              type: 'date',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              name: 'projectUrl',
              title: 'Project URL',
              type: 'url',
            }),
            defineField({
              name: 'associatedCapabilities',
              title: 'Associated Capabilities',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{ type: 'capabilities' }],
                },
              ],
              validation: (Rule) => Rule.unique(),
            }),
          ],
          preview: {
            select: {
              title: 'projectTitle',
              subtitle: 'clientOrCompany',
              media: 'projectImage',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'recommendations',
      title: 'Recommendations / Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
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
              name: 'profileImage',
              title: 'Profile Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'testimonial',
              title: 'Testimonial',
              type: 'text',
              rows: 4,
            }),
            defineField({
              name: 'relationship',
              title: 'Relationship',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'company',
              media: 'profileImage',
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'fullName', direction: 'asc' }],
    },
    {
      title: 'Current Company (A-Z)',
      name: 'currentCompanyAsc',
      by: [{ field: 'currentCompany', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'fullName',
      subtitle: 'headline',
      media: 'profileImage',
    },
  },
})
