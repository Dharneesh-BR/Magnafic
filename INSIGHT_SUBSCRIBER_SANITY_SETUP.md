# Insight Subscriber Setup

Insight subscribers are now stored in Sanity as `insightSubscriber` documents.

## Required Netlify environment variables

- `SANITY_WRITE_TOKEN`: Sanity token with write access. Used by `/.netlify/functions/subscribe-insight`.
- `SANITY_READ_TOKEN` or `SANITY_API_READ_TOKEN`: Optional if the dataset is public, but recommended. Used by notification functions.
- `SENDGRID_API_KEY`: Sends subscriber notification emails.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Still used by `notify-insight-subscribers` to keep notification locks in Firestore and avoid duplicate sends.
- `SANITY_WEBHOOK_SECRET`: Optional shared secret for the Sanity webhook.

## Sanity webhook

Create one webhook in Sanity:

- URL: `https://YOUR_DOMAIN/.netlify/functions/notify-insight-subscribers`
- Dataset: `production`
- Trigger on: Create and Update
- Filter:

```groq
_type in ["blog", "youtubeVideos"] && !(_id in path("drafts.**"))
```

- Projection:

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

If you set `SANITY_WEBHOOK_SECRET`, send it as header:

```text
X-Sanity-Webhook-Secret: YOUR_SECRET_VALUE
```

## Existing Firebase subscribers

Existing subscribers in Firestore need to be migrated once into Sanity. Add each email as an `insightSubscriber` document with:

- `email`
- `status: active`
- `source: firebase-migration`
- `subscribedAt`
- `updatedAt`
