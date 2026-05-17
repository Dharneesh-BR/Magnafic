import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'eu2wjb5o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})
