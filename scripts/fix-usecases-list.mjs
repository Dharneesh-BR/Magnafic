import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'eu2wjb5o',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function fixUseCasesList() {
  console.log('Fetching capabilities with useCasesList...')
  
  const query = `*[_type == "capabilities" && defined(useCasesList) && useCasesList.length > 0] {
    _id,
    title,
    useCasesList
  }`
  
  const capabilities = await client.fetch(query)
  console.log(`Found ${capabilities.length} capabilities with useCasesList`)
  
  let fixedCount = 0
  
  for (const capability of capabilities) {
    const originalList = capability.useCasesList
    const fixedList = originalList.filter(item => {
      // Keep only objects that have the required structure
      return item && typeof item === 'object' && !Array.isArray(item) && item.title
    })
    
    if (fixedList.length !== originalList.length) {
      console.log(`\nFixing: ${capability.title}`)
      console.log(`  Original items: ${originalList.length}`)
      console.log(`  Fixed items: ${fixedList.length}`)
      console.log(`  Removed ${originalList.length - fixedList.length} invalid items`)
      
      await client.patch(capability._id).set({ useCasesList: fixedList }).commit()
      fixedCount++
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} capabilities`)
}

fixUseCasesList().catch(console.error)
