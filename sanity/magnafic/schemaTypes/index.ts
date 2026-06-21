import { mentorSchema } from './mentor'
import { capabilitiesSchema } from './capabilities'
import { servicesSchema } from './services'
import { youtubeVideosSchema } from './youtubeVideos'
import { problemQuestionSchema } from './problemQuestion'
import { mouDocumentSchema } from './mouDocument'
import { blogSchema } from './blog'
import { programsSchema } from './programs'
import { chatSessionSchema } from './chatSession'
import { homePageSettingsSchema } from './homePageSettings'
import { researchProjectSchema } from './researchProject'
import { researchSessionSchema } from './researchSession'
import { usageTrackingSchema } from './usageTracking'
import { workflowSchema } from './workflow'

export const schemaTypes = [
  mentorSchema,
  capabilitiesSchema,
  servicesSchema,
  youtubeVideosSchema,
  problemQuestionSchema,
  mouDocumentSchema,
  blogSchema,
  programsSchema,
  researchProjectSchema,
  researchSessionSchema,
  chatSessionSchema,
  usageTrackingSchema,
  workflowSchema,
  homePageSettingsSchema,
]
