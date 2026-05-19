import { createClient } from '@sanity/client'

// Client for blog content from project eu2wjb5o
export const blogClient = createClient({
  projectId: 'eu2wjb5o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Client for mentor and other schemas from project 8pf5fxwy
export const mentorClient = createClient({
  projectId: '8pf5fxwy',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Legacy export for backward compatibility
export const client = blogClient
