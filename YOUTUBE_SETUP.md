# YouTube API Setup Guide

To use the YoutubeVideos component, you need to set up the YouTube Data API v3 and configure your environment variables.

## Step 1: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for "YouTube Data API v3" and enable it
5. Go to **APIs & Services** > **Credentials**
6. Click **Create Credentials** > **API Key**
7. Copy the API key

## Step 2: Get Your Channel ID

### Option 1: From YouTube URL
1. Go to your YouTube channel
2. Look at the URL: `https://www.youtube.com/@magnafic`
3. Use a tool like [Comment Picker](https://commentpicker.com/youtube-channel-id.php) to convert your channel handle to ID

### Option 2: From YouTube Studio
1. Go to YouTube Studio
2. Settings > Channel > Basic info
3. Your channel ID will be listed there

## Step 3: Set Environment Variables

Create a `.env` file in your project root (or update existing one):

```env
VITE_YOUTUBE_API_KEY=your_actual_api_key_here
VITE_YOUTUBE_CHANNEL_ID=your_actual_channel_id_here
```

**Important:** Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Step 4: Usage

The YoutubeVideos component is already integrated into the Insights page. It will:

- Fetch the latest 6 videos from your channel
- Display them in a responsive grid
- Show video thumbnails, titles, duration, and view counts
- Open videos in a new tab when clicked
- Handle loading and error states gracefully

## API Quota

The YouTube Data API has a default quota of 10,000 units per day. Each video fetch uses approximately:
- 1 unit for channel lookup
- 1 unit for playlist items
- 1 unit for video details

This means you can fetch videos many times per day without hitting quota limits.

## Troubleshooting

### Error: "YouTube API key not found"
- Make sure you have a `.env` file with `VITE_YOUTUBE_API_KEY`
- Restart your development server after adding the variable

### Error: "Channel not found"
- Verify your channel ID is correct
- Make sure your channel is public

### Error: "Failed to fetch videos"
- Check your API quota in Google Cloud Console
- Ensure the YouTube Data API v3 is enabled
- Verify your API key has the correct permissions

### No videos showing
- Ensure your channel has public videos
- Check that videos are in your "Uploads" playlist
- Verify the API key has access to the channel
