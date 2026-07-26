import { useEffect, useRef } from 'react'

let playerSdkPromise

function loadPlayerSdk() {
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo)
  if (playerSdkPromise) return playerSdkPromise

  playerSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://player.vimeo.com/api/player.js'
    script.async = true
    script.onload = () => resolve(window.Vimeo)
    script.onerror = () => reject(new Error('Unable to load the Vimeo player.'))
    document.head.appendChild(script)
  })

  return playerSdkPromise
}

export default function LmsVideoPlayer({ url, initialSeconds = 0, onProgressSave }) {
  const iframeRef = useRef(null)
  const callbackRef = useRef(onProgressSave)
  const resumeSecondsRef = useRef(initialSeconds)
  const videoUrlRef = useRef(url)

  if (videoUrlRef.current !== url) {
    videoUrlRef.current = url
    resumeSecondsRef.current = initialSeconds
  }

  useEffect(() => {
    callbackRef.current = onProgressSave
  }, [onProgressSave])

  useEffect(() => {
    let player
    let disposed = false
    const resumeSeconds = resumeSecondsRef.current
    let lastSavedSeconds = resumeSeconds
    let saveQueue = Promise.resolve()

    const report = (data, completed = false) => {
      if (!data?.duration || !callbackRef.current) return
      const watchedSeconds = completed ? data.duration : data.seconds
      lastSavedSeconds = watchedSeconds
      const update = {
          watchedSeconds,
          durationSeconds: data.duration,
          ...(completed ? { completed: true, completionSource: 'video-ended' } : {}),
        }
      saveQueue = saveQueue
        .then(() => callbackRef.current?.(update))
        .catch(() => null)
    }

    loadPlayerSdk().then((Vimeo) => {
      if (disposed || !iframeRef.current) return
      player = new Vimeo.Player(iframeRef.current)
      player.ready().then(() => {
        if (resumeSeconds > 0) player.setCurrentTime(resumeSeconds).catch(() => null)
      })
      player.on('timeupdate', (data) => {
        if (data.seconds - lastSavedSeconds >= 5) report(data)
      })
      player.on('pause', (data) => report(data))
      player.on('ended', (data) => report(data, true))
    }).catch(() => null)

    return () => {
      disposed = true
      if (player) {
        Promise.all([player.getCurrentTime(), player.getDuration()])
          .then(([seconds, duration]) => report({ seconds, duration }))
          .catch(() => null)
          .finally(() => player.destroy().catch(() => null))
      }
    }
  }, [url])

  const playerUrl = new URL(url)
  playerUrl.searchParams.set('title', '0')
  playerUrl.searchParams.set('byline', '0')
  playerUrl.searchParams.set('portrait', '0')

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl">
      <iframe
        ref={iframeRef}
        src={playerUrl.href}
        title="Magnafic course video"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
      />
    </div>
  )
}
