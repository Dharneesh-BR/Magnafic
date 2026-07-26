import { auth } from './firebase'

export const isLmsFirebaseConfigured = Boolean(auth)
export const lmsAuth = auth
