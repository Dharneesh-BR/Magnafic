import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { AlertCircle, CheckCircle2, Download, Eye, FileText, Loader2, PenLine } from 'lucide-react'
import { mentorClient } from '../lib/sanityClient'
import { signMouDocument } from '../lib/mouSigning'
import SignatureModal from './SignatureModal'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function formatDateTime(date) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function statusClasses(status) {
  const normalizedStatus = status?.toLowerCase()

  if (normalizedStatus === 'signed') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (normalizedStatus === 'expired') return 'bg-red-50 text-red-700 ring-red-100'
  return 'bg-orange-50 text-orange-700 ring-orange-100'
}

function PDFPreview({ fileUrl }) {
  const wrapperRef = useRef(null)
  const [width, setWidth] = useState(720)
  const [numPages, setNumPages] = useState(0)

  useEffect(() => {
    if (!wrapperRef.current) return undefined

    const resizeObserver = new ResizeObserver(([entry]) => {
      setWidth(Math.min(entry.contentRect.width - 12, 1220))
    })

    resizeObserver.observe(wrapperRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} className="h-[92vh] overflow-auto rounded-2xl border border-gray-200 bg-gray-100 p-2">
      <Document
        file={fileUrl}
        loading={<div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary-600" /></div>}
        error={<div className="rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">Unable to render this PDF.</div>}
        onLoadSuccess={({ numPages: nextNumPages }) => setNumPages(nextNumPages)}
      >
        <div className="space-y-4">
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page-${index + 1}`}
              pageNumber={index + 1}
              width={Math.max(280, width)}
              renderAnnotationLayer
              renderTextLayer
            />
          ))}
        </div>
      </Document>
    </div>
  )
}

export default function ConsultantDocuments({ user, expert }) {
  const [documents, setDocuments] = useState([])
  const [selectedDocumentId, setSelectedDocumentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedDocument = useMemo(
    () => documents.find((item) => item._id === selectedDocumentId) || documents[0],
    [documents, selectedDocumentId]
  )

  const fetchDocuments = async () => {
    if (!user?.sanityExpertId) {
      setDocuments([])
      setSelectedDocumentId('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const query = `*[_type == "mouDocument" && consultant._ref == $consultantId] | order(createdAt desc, _createdAt desc) {
        _id,
        title,
        status,
        version,
        createdAt,
        signedAt,
        signedPdf,
        "pdfUrl": pdfFile.asset->url,
        "pdfFileName": pdfFile.asset->originalFilename,
        auditTrail
      }`

      const data = await mentorClient.fetch(query, { consultantId: user.sanityExpertId.trim() })
      setDocuments(data || [])
      setSelectedDocumentId((currentId) => (
        data?.some((item) => item._id === currentId) ? currentId : data?.[0]?._id || ''
      ))
    } catch (fetchError) {
      console.error('Error fetching assigned documents:', fetchError)
      setError('Unable to load your assigned documents right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [user?.sanityExpertId])

  const handleSign = async (signatureDataUrl) => {
    if (!selectedDocument) return

    setSigning(true)
    setError('')
    setSuccess('')

    try {
      const signedResult = await signMouDocument({
        document: selectedDocument,
        signatureDataUrl,
        consultant: {
          ...user,
          name: expert?.fullName || user?.name || user?.email,
          fullName: expert?.fullName,
        },
      })

      setDocuments((currentDocuments) => currentDocuments.map((item) => (
        item._id === selectedDocument._id
          ? {
              ...item,
              status: 'signed',
              signedAt: signedResult.signedAt,
              signedPdf: signedResult.signedPdfUrl,
              auditTrail: [...(item.auditTrail || []), signedResult.auditEntry],
            }
          : item
      )))
      setSignatureOpen(false)
      setSuccess('Document successfully signed and recorded.')
    } catch (signError) {
      console.error('Error signing document:', signError)
      setError(signError?.message || 'Unable to sign this document right now.')
    } finally {
      setSigning(false)
    }
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Assigned Documents</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-950">Documents</h2>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
      </div>

      {error && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {!loading && documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-primary-500" />
          <h3 className="text-lg font-bold text-gray-950">No documents assigned yet</h3>
          <p className="mt-2 text-sm text-gray-600">When an admin assigns an MOU to your consultant profile, it will appear here.</p>
        </div>
      ) : selectedDocument && (
        <div className="grid gap-4 xl:grid-cols-[210px_minmax(0,1fr)]">
          <div className="space-y-3">
            {documents.map((document) => (
              <button
                key={document._id}
                type="button"
                onClick={() => {
                  setSelectedDocumentId(document._id)
                  setSuccess('')
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedDocument._id === document._id
                    ? 'border-primary-200 bg-primary-50 shadow-lg shadow-primary-900/5'
                    : 'border-gray-100 bg-white hover:border-primary-100 hover:bg-primary-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-bold text-gray-950">{document.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${statusClasses(document.status)}`}>
                        {document.status || 'pending'}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-medium text-gray-500">Assigned: {formatDateTime(document.createdAt)}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary-700">
                      <Eye className="h-3.5 w-3.5" />
                      View PDF
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="min-w-0">
            <div className="mb-4 rounded-3xl bg-gradient-to-r from-primary-600 to-cyan-500 p-[1px]">
              <div className="rounded-3xl bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="break-words text-2xl font-bold text-gray-950">{selectedDocument.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${statusClasses(selectedDocument.status)}`}>
                        {selectedDocument.status || 'pending'}
                      </span>
                      <span>Assigned: {formatDateTime(selectedDocument.createdAt)}</span>
                      <span>Version: {selectedDocument.version || '1.0'}</span>
                    </div>
                    {selectedDocument.status === 'signed' && selectedDocument.signedAt && (
                      <p className="mt-3 text-sm font-semibold text-emerald-700">
                        Signed On: {formatDateTime(selectedDocument.signedAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.signedPdf ? (
                      <>
                        <a
                          href={selectedDocument.signedPdf}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-primary-200 hover:text-primary-700"
                        >
                          <Eye className="h-4 w-4" />
                          View Signed PDF
                        </a>
                        <a
                          href={selectedDocument.signedPdf}
                          download
                          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700"
                        >
                          <Download className="h-4 w-4" />
                          Download Signed PDF
                        </a>
                      </>
                    ) : selectedDocument.status !== 'expired' && (
                      <button
                        type="button"
                        onClick={() => setSignatureOpen(true)}
                        disabled={signing}
                        className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                        Sign Document
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedDocument.signedPdf && (
              <div className="mb-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Document successfully signed and recorded.</p>
              </div>
            )}

            {selectedDocument.pdfUrl ? (
              <PDFPreview fileUrl={selectedDocument.signedPdf || selectedDocument.pdfUrl} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <FileText className="mx-auto mb-4 h-10 w-10 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-950">PDF not uploaded</h3>
                <p className="mt-2 text-sm text-gray-600">Upload the PDF file in Sanity to preview it here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <SignatureModal
        open={signatureOpen}
        documentTitle={selectedDocument?.title}
        signerName={expert?.fullName || user?.name || user?.email}
        loading={signing}
        onClose={() => {
          if (!signing) setSignatureOpen(false)
        }}
        onSubmit={handleSign}
      />
    </section>
  )
}
