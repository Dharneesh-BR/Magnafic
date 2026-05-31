import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { AlertCircle, Loader2, X } from 'lucide-react'

export default function SignatureModal({ open, documentTitle, signerName, onClose, onSubmit, loading }) {
  const signatureRef = useRef(null)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [hasTypedSignature, setHasTypedSignature] = useState(false)

  const drawTypedSignature = () => {
    const canvas = signatureRef.current?.getCanvas()
    const name = signerName || 'Consultant'

    if (!canvas) return

    const context = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const fontSize = Math.max(34, Math.min(58, width / Math.max(name.length * 0.55, 8)))

    signatureRef.current?.clear()
    context.fillStyle = '#111827'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = `${fontSize}px "Brush Script MT", "Segoe Script", cursive`
    context.fillText(name, width / 2, height / 2)
    context.strokeStyle = '#111827'
    context.lineWidth = 1
    context.globalAlpha = 0.25
    context.beginPath()
    context.moveTo(width * 0.22, height * 0.66)
    context.lineTo(width * 0.78, height * 0.66)
    context.stroke()
    context.globalAlpha = 1
    setHasTypedSignature(true)
  }

  useEffect(() => {
    if (!open) return

    setAgreed(false)
    setError('')
    setHasTypedSignature(false)
    signatureRef.current?.clear()
  }, [open])

  useEffect(() => {
    if (agreed) {
      window.requestAnimationFrame(drawTypedSignature)
    } else {
      signatureRef.current?.clear()
      setHasTypedSignature(false)
    }
  }, [agreed, signerName])

  const handleClear = () => {
    signatureRef.current?.clear()
    if (agreed) {
      window.requestAnimationFrame(drawTypedSignature)
    } else {
      setHasTypedSignature(false)
    }
    setError('')
  }

  const handleSubmit = async () => {
    if (!agreed) return

    if (!signatureRef.current || (!hasTypedSignature && signatureRef.current.isEmpty())) {
      setError('Please draw your signature before submitting.')
      return
    }

    setError('')
    await onSubmit(signatureRef.current.toDataURL('image/png'))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-gray-950/25">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Electronic Signature</p>
            <h2 className="mt-1 text-xl font-bold text-gray-950">Draw Your Signature</h2>
            <p className="mt-1 text-sm text-gray-500">{documentTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close signature modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-[#fbfcff]">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'h-56 w-full cursor-crosshair bg-white',
              }}
              penColor="#111827"
              minWidth={1.4}
              maxWidth={3.2}
            />
          </div>

          <label className="flex gap-3 rounded-2xl bg-primary-50 px-4 py-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>I have read and agree to the Magnafic MOU and electronically sign this document.</span>
          </label>

          {error && (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!agreed || loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
