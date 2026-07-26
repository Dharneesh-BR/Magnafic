import { useEffect, useState } from 'react'
import { Award, CheckCircle2, Download, Linkedin, ShieldCheck } from 'lucide-react'
import { lmsApi, lmsDownload, shareCertificateOnLinkedIn } from '../lib/lmsApi'

function formatCompletion(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value))
}

export default function CertificateClaim({ courseId }) {
  const [eligibility, setEligibility] = useState(null)
  const [recipientName, setRecipientName] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    lmsApi(`/api/certificates/eligibility/${courseId}`)
      .then((result) => {
        if (!mounted) return
        setEligibility(result)
        setRecipientName(result.certificate?.recipientName || result.suggestedName || '')
      })
      .catch((loadError) => {
        if (mounted) setError(loadError.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [courseId])

  const issue = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await lmsApi(`/api/certificates/${courseId}/issue`, {
        method: 'POST',
        body: JSON.stringify({ recipientName }),
      })
      setEligibility((current) => ({ ...current, certificate: result.certificate }))
    } catch (issueError) {
      setError(issueError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const download = async () => {
    const certificate = eligibility?.certificate
    if (!certificate) return
    setDownloading(true)
    setError('')
    try {
      await lmsDownload(
        `/api/certificates/${certificate.certificateNumber}/pdf`,
        `${certificate.certificateNumber}.pdf`,
      )
    } catch (downloadError) {
      setError(downloadError.message)
    } finally {
      setDownloading(false)
    }
  }

  const share = async () => {
    const certificate = eligibility?.certificate
    if (!certificate) return
    setSharing(true)
    setError('')
    try {
      const updatedCertificate = await shareCertificateOnLinkedIn(certificate)
      setEligibility((current) => ({ ...current, certificate: updatedCertificate }))
    } catch (shareError) {
      setError(shareError.message)
    } finally {
      setSharing(false)
    }
  }

  if (loading) return <div className="mt-8 rounded-2xl bg-white p-6 font-semibold text-gray-500 ring-1 ring-gray-100">Loading certificate eligibility...</div>
  if (!eligibility?.courseCompleted) return null

  const certificate = eligibility.certificate
  return (
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-lg shadow-primary-900/5 ring-1 ring-primary-100 sm:p-7">
      <div className="flex items-start gap-3">
        <Award className="h-7 w-7 shrink-0 text-primary-600" />
        <div>
          <h2 className="text-xl font-black text-gray-950 sm:text-2xl">Course completion certificate</h2>
          <p className="mt-2 leading-7 text-gray-600">
            {certificate
              ? 'Your certificate has been issued and is ready.'
              : 'Confirm the name that should appear on your certificate.'}
          </p>
        </div>
      </div>

      {certificate ? (
        <div className="mt-6 rounded-xl bg-green-50 p-4">
          <div className="flex items-center gap-2 font-black text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            {certificate.recipientName}
          </div>
          <p className="mt-2 text-sm font-semibold text-green-800">
            Completed {formatCompletion(certificate.completedAt)}
          </p>
          <p className="mt-1 text-xs font-bold text-green-700">{certificate.certificateNumber}</p>
          {certificate.linkedinSharedAt ? (
            <>
              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-green-700">
                <Linkedin className="h-4 w-4" />
                Shared on LinkedIn. Download is unlocked.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={share}
                  disabled={sharing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a66c2] px-5 py-3 font-black text-white disabled:opacity-60 sm:w-auto"
                >
                  <Linkedin className="h-5 w-5" />
                  {sharing ? 'Opening LinkedIn...' : 'Share again'}
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={downloading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-black text-white disabled:opacity-60 sm:w-auto"
                >
                  <Download className="h-5 w-5" />
                  {downloading ? 'Preparing PDF...' : 'Download certificate'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm font-semibold text-green-800">
                Share your achievement on LinkedIn to unlock the certificate download.
              </p>
              <button
                type="button"
                onClick={share}
                disabled={sharing}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a66c2] px-5 py-3 font-black text-white disabled:opacity-60 sm:w-auto"
              >
                <Linkedin className="h-5 w-5" />
                {sharing ? 'Opening LinkedIn...' : 'Share on LinkedIn'}
              </button>
            </>
          )}
        </div>
      ) : eligibility.eligible ? (
        <form onSubmit={issue} className="mt-6 max-w-xl space-y-4">
          <label className="block">
            <span className="text-sm font-black text-gray-800">Name on certificate</span>
            <input
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-950 outline-none ring-primary-200 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-gray-800">Completion date and time</span>
            <input
              value={formatCompletion(eligibility.completedAt)}
              readOnly
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-primary-50 p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary-600"
            />
            <span className="text-sm font-semibold leading-6 text-primary-900">
              I confirm that this name is correct. Changes after issuance require administrator support.
            </span>
          </label>
          <button
            disabled={!confirmed || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <ShieldCheck className="h-5 w-5" />
            {submitting ? 'Generating certificate...' : 'Generate certificate'}
          </button>
        </form>
      ) : (
        <p className="mt-5 rounded-xl bg-amber-50 p-4 font-bold text-amber-800">
          A certificate template must be configured for this course in Sanity.
        </p>
      )}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </section>
  )
}
