import { defineField, defineType } from 'sanity'

export const mouDocumentSchema = defineType({
  name: 'mouDocument',
  title: 'MOU Document',
  type: 'document',
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
      name: 'consultant',
      title: 'Consultant',
      type: 'reference',
      description: 'Select the mentor/consultant who should receive this document.',
      to: [{ type: 'mentor' }],
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
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      consultantName: 'consultant.fullName',
      status: 'status',
      version: 'version',
    },
    prepare({ title, consultantName, status, version }) {
      return {
        title,
        subtitle: [consultantName, status, version ? `v${version}` : ''].filter(Boolean).join(' | '),
      }
    },
  },
})
