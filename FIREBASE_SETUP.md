# Firebase Setup

This React + Vite app uses the Firebase modular web SDK with Authentication, Firestore, Storage, and optional Analytics.

## Folder Structure

```text
src/
  lib/
    firebase.js           # Firebase app, auth, firestore, storage exports
    auth.js               # App auth helpers used by login/signup pages
    firebaseExamples.js   # Example modular SDK operations
.env.example              # Required VITE_ Firebase environment variables
```

## Install

Firebase is already installed in this project:

```bash
npm install firebase
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SITE_URL=https://magnafic.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Never commit `.env`. Firebase web config is not a server secret, but environment-specific values should still be managed outside source control.

## Firebase Console Steps

1. Go to Firebase Console and create a project.
2. Open Project settings, then add a Web app.
3. Copy the web config values into `.env`.
4. Open Authentication, then Sign-in method, and enable Email/Password.
5. Open Firestore Database and create a database.
6. Open Storage and create a default bucket.
7. Add your production domain under Authentication, Settings, Authorized domains.

## Security Rules

Start restrictive and open only what the app needs.

Firestore example:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }

    match /clientBriefs/{documentId} {
      allow create: if request.auth != null
        && request.resource.data.clientId == request.auth.uid;

      allow read: if request.auth != null
        && (
          resource.data.clientId == request.auth.uid ||
          resource.data.assignedConsultantId == request.auth.uid
        );

      allow update: if request.auth != null
        && resource.data.clientId == request.auth.uid;

      allow delete: if false;
    }
  }
}
```

If login succeeds in Firebase Auth but the console shows `Missing or insufficient permissions`, your Firestore rules are blocking the app from reading `users/{uid}` after login. The `/users/{userId}` rule above is required for profile reads and writes.

The dynamic dashboards also require the `clientBriefs` rule above. Clients create and read their own briefs through `clientId`; consultants read assigned briefs through `assignedConsultantId`.

Storage example:

```js
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Usage Examples

```js
import {
  exampleAddFirestoreDocument,
  exampleLoginWithEmail,
  exampleLogout,
  exampleReadFirestoreDocuments,
  exampleSignupWithEmail,
  exampleUploadImage,
} from './src/lib/firebaseExamples'

await exampleSignupWithEmail({
  name: 'Client User',
  email: 'client@company.com',
  password: 'strong-password',
})

await exampleLoginWithEmail({
  email: 'client@company.com',
  password: 'strong-password',
})

await exampleAddFirestoreDocument('clientBriefs', {
  title: 'Launch GTM project',
  status: 'new',
})

const briefs = await exampleReadFirestoreDocuments('clientBriefs')

const imageUrl = await exampleUploadImage(file, `uploads/${user.uid}`)

await exampleLogout()
```

## Best Practices

- Keep `.env` out of Git.
- Use Firebase Security Rules as the real permission layer.
- Validate file type and file size before upload.
- Store uploads under user-specific paths when possible.
- Add production domains to Firebase authorized domains.
- Avoid storing sensitive business secrets in frontend code.
- Use server-side Cloud Functions for privileged admin operations.
