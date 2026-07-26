import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, CheckCircle2, XCircle } from 'lucide-react'
import SEO from '../components/SEO'
import MagnaLoader from '../components/MagnaLoader'
import { lmsApi } from '../lib/lmsApi'

export default function CertificateVerification() {
  const { certificateNumber } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    lmsApi(`/api/certificates/verify/${certificateNumber}`)
      .then(setResult)
      .catch((verifyError) => setError(verifyError.message))
      .finally(() => setLoading(false))
  }, [certificateNumber])

  if (loading) return <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28"><MagnaLoader message="Verifying certificate..." className="mx-auto max-w-2xl" /></div>

  const certificate = result?.certificate
  return (
    <main className="min-h-screen bg-[#f7f9ff] px-4 pb-16 pt-28 sm:px-6">
      <SEO title="Verify Certificate | Magnafic" description="Verify a Magnafic Academy certificate." noIndex />
      <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl ring-1 ring-gray-100 sm:p-9">
        {certificate ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="mt-4 text-3xl font-black text-gray-950">Valid certificate</h1>
            <Award className="mx-auto mt-6 h-8 w-8 text-primary-600" />
            <p className="mt-3 text-lg text-gray-600">Awarded to</p>
            <p className="mt-1 break-words text-2xl font-black text-primary-950">{certificate.recipientName}</p>
            <p className="mt-5 text-gray-600">For successfully completing</p>
            <p className="mt-1 text-xl font-black text-gray-950">{certificate.courseTitle}</p>
            <p className="mt-5 text-sm font-semibold text-gray-500">
              Completed {new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(certificate.completedAt))}
            </p>
            <p className="mt-2 text-xs font-black text-primary-600">{certificate.certificateNumber}</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h1 className="mt-4 text-3xl font-black text-gray-950">Certificate not found</h1>
            <p className="mt-3 text-gray-600">{error || 'This certificate number could not be verified.'}</p>
          </>
        )}
        <Link to="/courses" className="mt-7 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-black text-white">Explore Magnafic courses</Link>
      </section>
    </main>
  )
}
