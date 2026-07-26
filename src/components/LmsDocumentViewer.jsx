import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, FileWarning, LoaderCircle } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

function useContainerWidth(ref, maximum = 960) {
  const [width, setWidth] = useState(720)

  useEffect(() => {
    if (!ref.current) return undefined
    const updateWidth = () => setWidth(Math.min(maximum, Math.max(280, ref.current.clientWidth - 2)))
    const observer = new ResizeObserver(updateWidth)
    observer.observe(ref.current)
    updateWidth()
    return () => observer.disconnect()
  }, [maximum, ref])

  return width
}

function ViewerStatus({ children }) {
  return (
    <div className="flex min-h-64 items-center justify-center bg-gray-50 p-6 text-center text-sm font-bold text-gray-600">
      {children}
    </div>
  )
}

function PdfViewer({ material, onReachedEnd }) {
  const containerRef = useRef(null)
  const completedRef = useRef(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const width = useContainerWidth(containerRef)

  useEffect(() => {
    completedRef.current = false
    setPageNumber(1)
    setPageCount(0)
  }, [material.url])

  useEffect(() => {
    if (!onReachedEnd || !pageCount || pageNumber !== pageCount || completedRef.current) return
    completedRef.current = true
    onReachedEnd()
  }, [onReachedEnd, pageCount, pageNumber])

  return (
    <div ref={containerRef} className="min-w-0 bg-gray-100">
      <Document
        file={material.url}
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        loading={<ViewerStatus><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading PDF...</ViewerStatus>}
        error={<ViewerStatus><FileWarning className="mr-2 h-5 w-5" />Unable to display this PDF.</ViewerStatus>}
      >
        <div className="flex min-h-80 justify-center overflow-auto bg-gray-100 py-3 sm:py-5">
          <Page pageNumber={pageNumber} width={width} />
        </div>
      </Document>
      {pageCount > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-3">
          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            disabled={pageNumber === 1}
            aria-label="Previous page"
            className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-black text-gray-700">Page {pageNumber} of {pageCount}</span>
          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.min(pageCount, current + 1))}
            disabled={pageNumber === pageCount}
            aria-label="Next page"
            className="grid h-10 w-10 place-items-center rounded-lg bg-primary-600 text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function PptxViewer({ material, onReachedEnd }) {
  const canvasRef = useRef(null)
  const viewerRef = useRef(null)
  const completionRef = useRef(onReachedEnd)
  const completedRef = useRef(false)
  const [status, setStatus] = useState('loading')
  const [slideIndex, setSlideIndex] = useState(0)
  const [slideCount, setSlideCount] = useState(0)
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    completionRef.current = onReachedEnd
  }, [onReachedEnd])

  useEffect(() => {
    let disposed = false
    completedRef.current = false
    setStatus('loading')
    setSlideIndex(0)
    setSlideCount(0)

    const loadPresentation = async () => {
      const [response, { PPTXViewer }] = await Promise.all([
        fetch(material.url),
        import('pptxviewjs'),
      ])
      if (!response.ok) throw new Error(`Unable to load presentation: HTTP ${response.status}`)
      const buffer = await response.arrayBuffer()
      if (disposed || !canvasRef.current) return

      const viewer = new PPTXViewer({
        canvas: canvasRef.current,
        slideSizeMode: 'fit',
        backgroundColor: '#000000',
      })
      viewerRef.current = viewer
      await viewer.loadFile(buffer)
      await viewer.render(canvasRef.current)
      if (disposed) return

      const total = viewer.getSlideCount()
      const current = viewer.getCurrentSlideIndex()
      setSlideCount(total)
      setSlideIndex(current)
      if (completionRef.current && total > 0 && current === total - 1) {
        completedRef.current = true
        completionRef.current()
      }
      setStatus('ready')
    }

    loadPresentation().catch(() => {
      if (!disposed) setStatus('error')
    })

    return () => {
      disposed = true
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [material.url])

  const navigate = async (direction) => {
    const viewer = viewerRef.current
    if (!viewer || navigating) return
    setNavigating(true)
    try {
      if (direction === 'next') {
        await viewer.nextSlide(canvasRef.current)
      } else {
        await viewer.previousSlide(canvasRef.current)
      }
      const current = viewer.getCurrentSlideIndex()
      const total = viewer.getSlideCount()
      setSlideIndex(current)
      setSlideCount(total)
      if (
        completionRef.current &&
        total > 0 &&
        current === total - 1 &&
        !completedRef.current
      ) {
        completedRef.current = true
        completionRef.current()
      }
    } finally {
      setNavigating(false)
    }
  }

  return (
    <div className="relative min-w-0 bg-black">
      {status === 'loading' && <ViewerStatus><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Loading presentation...</ViewerStatus>}
      {status === 'error' && <ViewerStatus><FileWarning className="mr-2 h-5 w-5" />Unable to display this presentation.</ViewerStatus>}
      <canvas ref={canvasRef} className={`h-auto w-full ${status === 'error' ? 'hidden' : ''}`} />
      {status === 'ready' && slideCount > 0 && (
        <div className="flex items-center justify-between border-t border-gray-700 bg-white px-3 py-3">
          <button
            type="button"
            onClick={() => navigate('previous')}
            disabled={navigating || slideIndex === 0}
            aria-label="Previous slide"
            className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-black text-gray-700">Slide {slideIndex + 1} of {slideCount}</span>
          <button
            type="button"
            onClick={() => navigate('next')}
            disabled={navigating || slideIndex === slideCount - 1}
            aria-label="Next slide"
            className="grid h-10 w-10 place-items-center rounded-lg bg-primary-600 text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function LegacyPresentationViewer({ material }) {
  const embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(material.url)}`

  return (
    <div>
      <iframe
        src={embedUrl}
        title={material.title}
        className="h-[70dvh] min-h-80 w-full bg-gray-50 sm:h-[32rem]"
        loading="lazy"
      />
      <p className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        Legacy .ppt files cannot report the current slide. Upload this lesson content as PDF or .pptx to enable automatic completion.
      </p>
    </div>
  )
}

export default function LmsDocumentViewer({ material, onReachedEnd }) {
  const extension = String(material.extension || material.fileName?.split('.').pop() || '').toLowerCase()
  const isPdf = extension === 'pdf' || material.mimeType === 'application/pdf'
  const isPptx = extension === 'pptx'

  if (isPdf) return <PdfViewer material={material} onReachedEnd={onReachedEnd} />
  if (isPptx) return <PptxViewer material={material} onReachedEnd={onReachedEnd} />
  return <LegacyPresentationViewer material={material} />
}
