import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Send, X } from 'lucide-react'
import { db } from '../lib/firebase'

const initialForm = {
  name: '',
  contactNo: '',
  email: '',
  linkedin: '',
  reason: ''
}

export default function CommunityApplicationModal({
  open,
  onClose,
  clubName = 'Magnafic Community',
  reasonLabel = 'Why do you want to join?'
}) {
  const [formData, setFormData] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [submitError, setSubmitError] = useState('')

  if (!open) return null

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('')
    setSubmitError('')

    try {
      await addDoc(collection(db, 'communityApplications'), {
        clubName,
        name: formData.name.trim(),
        contactNo: formData.contactNo.trim(),
        email: formData.email.trim(),
        linkedin: formData.linkedin.trim(),
        reason: formData.reason.trim(),
        status: 'new',
        sourcePath: window.location.pathname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      setSubmitStatus('success')
      setFormData(initialForm)
    } catch (error) {
      console.error('Application submission failed:', error)
      setSubmitStatus('error')
      setSubmitError('Unable to submit right now. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000047]/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-950"
          aria-label="Close application form"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-primary px-6 py-8 text-white sm:px-8">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-50">
            Application Form
          </p>
          <h2 className="pr-10 text-2xl font-extrabold sm:text-3xl">{clubName}</h2>
          <p className="mt-3 leading-7 text-white/80">
            Share your details and Magnafic will review your application.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="application-name" className="mb-2 block text-sm font-bold text-gray-800">
              Name *
            </label>
            <input
              id="application-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Your full name"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="application-phone" className="mb-2 block text-sm font-bold text-gray-800">
                Contact No *
              </label>
              <input
                id="application-phone"
                name="contactNo"
                type="tel"
                value={formData.contactNo}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label htmlFor="application-email" className="mb-2 block text-sm font-bold text-gray-800">
                Email ID *
              </label>
              <input
                id="application-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="application-linkedin" className="mb-2 block text-sm font-bold text-gray-800">
              LinkedIn Link *
            </label>
            <input
              id="application-linkedin"
              name="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </div>

          <div>
            <label htmlFor="application-reason" className="mb-2 block text-sm font-bold text-gray-800">
              {reasonLabel} *
            </label>
            <textarea
              id="application-reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Tell us about your background, goals, and what you hope to contribute or learn."
            />
          </div>

          {submitStatus === 'success' && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center font-semibold text-emerald-700">
              Thank you. Your application has been submitted successfully and is now available in the admin dashboard.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-4 font-extrabold text-white shadow-glow-combined transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send className="h-5 w-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
