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
VITE_SANITY_WRITE_TOKEN=your_sanity_write_token
```

Never commit `.env`. Firebase web config is not a server secret, but environment-specific values should still be managed outside source control.
`VITE_SANITY_WRITE_TOKEN` is required for the consultant document signing flow to upload the signed PDF/signature assets to Sanity and update the signed PDF URL, status, timestamp, and audit trail.

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
      allow read: if request.auth != null
        && (
          request.auth.uid == userId ||
          resource.data.email == request.auth.token.email ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
        );
      allow update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null
        && (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
        );
    }

    match /consultants/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if false;
    }

    match /clientBriefs/{documentId} {
      allow create: if request.auth != null
        && request.resource.data.clientId == request.auth.uid;

      allow read: if request.auth != null
        && (
          resource.data.clientId == request.auth.uid ||
          resource.data.assignedConsultantId == request.auth.uid ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true ||
          (
            resource.data.keys().hasAny(['matchedExpertIds']) &&
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.sanityExpertId in resource.data.matchedExpertIds
          )
        );

      allow update: if request.auth != null
        && resource.data.clientId == request.auth.uid;

      allow delete: if request.auth != null
        && (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
        );
    }
  }
}
```

If login succeeds in Firebase Auth but the console shows `Missing or insufficient permissions`, your Firestore rules are blocking the app from reading `users/{uid}` after login. The `/users/{userId}` rule above is required for profile reads and writes.

Consultant accounts are admin-created, not self-created from the public site. Create the consultant in Firebase Authentication, then create `users/{uid}` in Firestore with `role: consultant`. You can optionally create `consultants/{uid}` for profile details; the Firebase Console and Admin SDK bypass the client-side `allow create: if false` rule.

The dynamic dashboards also require the `clientBriefs` rule above. Clients create and read their own briefs through `clientId`; consultants read assigned briefs through `assignedConsultantId` or through `matchedExpertIds` when their `users/{uid}.sanityExpertId` is linked to a matching Sanity expert profile.

For automatic opportunity routing, set the `Selected Capability` field on relevant Describe Your Problem answer options in Sanity. When a client chooses that option and signs up, the app creates a `clientBriefs` document with `capabilityId`, `capabilitySlug`, and `matchedExpertIds` from that capability's ordered experts.

## Admin Dashboard

The admin dashboard is available at `/admin` and does not render the public website header, footer, or pages. Create the admin in Firebase Authentication, then create `users/{uid}` in Firestore with either:

```js
{
  name: 'Admin Name',
  email: 'admin@company.com',
  role: 'admin'
}
```

or:

```js
{
  name: 'Admin Name',
  email: 'admin@company.com',
  isAdmin: true
}
```

The admin login form validates the signed-in user against this Firestore document before showing dashboard data.

## Consultant Onboarding

1. Create the consultant in Firebase Authentication with their professional email and a temporary password.
2. Copy the generated user `uid`.
3. Create `users/{uid}` in Firestore.
4. Create `consultants/{uid}` in Firestore.
5. Share the login email and temporary password with the consultant.
6. Ask them to use Login, choose Consultant, and click Reset password after signing in or before their first sign-in.

### Consultant Firestore Collections

Firebase Firestore uses collections instead of SQL tables. If you generate consultant IDs yourself, use that generated ID as the document ID in both collections and keep `email` exactly the same as the Firebase Authentication email.

#### `users/{generatedConsultantId}`

This is required for login routing. The app finds this document by consultant email after Firebase Auth login and uses `role: consultant` plus `sanityExpertId` to load the consultant dashboard profile.

```js
{
  name: 'Consultant Name',
  email: 'consultant@company.com',
  role: 'consultant',
  sanityExpertId: 'e3497cc4-e7a1-459f-bcca-583aeeb8473f',
  company: 'Company Name',
  status: 'active',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### `consultants/{generatedConsultantId}`

This is the consultant profile table/collection. Use it for admin-managed consultant data, profile details, matching, and future dashboard fields.

```js
{
  userId: 'firebase-auth-uid',
  sanityExpertId: 'e3497cc4-e7a1-459f-bcca-583aeeb8473f',
  name: 'Consultant Name',
  email: 'consultant@company.com',
  phone: '',
  company: 'Company Name',
  headline: 'Fractional growth leader',
  expertise: ['Digital Transformation', 'Business Strategy'],
  industries: ['Consumer Brands', 'Retail'],
  location: 'Bengaluru, India',
  experienceYears: 10,
  hourlyRate: null,
  availability: 'available',
  status: 'active',
  verificationStatus: 'verified',
  profileImageUrl: '',
  bio: '',
  linkedinUrl: '',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

Recommended status values:

- `active`: consultant can access dashboard.
- `inactive`: consultant exists but should not be assigned new work.
- `pending_review`: profile exists but is not approved yet.

Recommended availability values:

- `available`
- `limited`
- `unavailable`

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

## Insight Subscribers

The Insights page stores email subscribers in Sanity as `insightSubscriber` documents through the Netlify Function:

```text
/.netlify/functions/subscribe-insight
```

Each Sanity document contains `email`, `status`, `source`, `subscribedAt`, and `updatedAt`.

The notification function also stores delivery lock/history records in Sanity as `insightNotification` documents, so Firebase is not required for this flow.

### Deploy Insight Notifications

Configure these Netlify environment variables:

```text
SENDGRID_API_KEY=SENDGRID_API_KEY
SITE_URL=https://magnafic.com
SANITY_WRITE_TOKEN=token-with-write-access
SANITY_READ_TOKEN=token-with-read-access
SANITY_WEBHOOK_SECRET=choose-a-long-random-secret
```

Create a Sanity webhook for published insights and videos:

- Dataset: `production`
- Filter: `_type in ["blog", "youtubeVideos"] && !(_id in path("drafts.**"))`
- Projection/body:

```groq
{
  _id,
  _type,
  title,
  excerpt,
  description,
  status,
  "slug": slug.current,
  youtubeUrl,
  publishedAt,
  _updatedAt
}
```

- Method: `POST`
- URL: `https://YOUR_NETLIFY_SITE.netlify.app/.netlify/functions/notify-insight-subscribers`
- Header: `x-sanity-webhook-secret: choose-a-long-random-secret`

The function reads active Sanity `insightSubscriber` documents, sends emails via SendGrid, and records one Sanity `insightNotification` document per sent insight.
