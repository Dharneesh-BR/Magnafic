import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from './firebase'

function getFirebaseErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.'
    case 'auth/invalid-email':
      return 'The authentication provider could not accept this email value.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'permission-denied':
      return 'You do not have permission to perform this action.'
    case 'storage/unauthorized':
      return 'You do not have permission to upload this file.'
    default:
      return error?.message || 'Something went wrong. Please try again.'
  }
}

export async function exampleSignupWithEmail({ name, email, password }) {
  try {
    const credentials = await createUserWithEmailAndPassword(auth, email, password)

    if (name) {
      await updateProfile(credentials.user, { displayName: name })
    }

    return credentials.user
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error))
  }
}

export async function exampleLoginWithEmail({ email, password }) {
  try {
    const credentials = await signInWithEmailAndPassword(auth, email, password)
    return credentials.user
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error))
  }
}

export async function exampleLogout() {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error))
  }
}

export async function exampleAddFirestoreDocument(collectionName, data) {
  try {
    const documentRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return documentRef.id
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error))
  }
}

export async function exampleReadFirestoreDocuments(collectionName) {
  try {
    const documentsQuery = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(documentsQuery)

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }))
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error))
  }
}

export async function exampleUploadImage(file, folder = 'uploads') {
  if (!file) {
    throw new Error('Please choose an image to upload.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const imageRef = ref(storage, `${folder}/${Date.now()}-${safeName}`)

    await uploadBytes(imageRef, file, {
      contentType: file.type,
    })

    return getDownloadURL(imageRef)
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error))
  }
}
