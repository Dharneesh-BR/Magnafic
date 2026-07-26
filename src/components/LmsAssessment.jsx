import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Lock, RotateCcw } from 'lucide-react'
import { lmsApi } from '../lib/lmsApi'

export default function LmsAssessment({ endpoint, locked = false, onPassed }) {
  const [assessment, setAssessment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(!locked)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (locked) return
    let mounted = true
    setLoading(true)
    lmsApi(endpoint)
      .then((payload) => {
        if (mounted) setAssessment(payload.assessment)
      })
      .catch((loadError) => {
        if (mounted) setError(loadError.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [endpoint, locked])

  const selectAnswer = (question, optionKey, checked) => {
    setAnswers((current) => {
      if (question.questionType === 'multipleChoice') {
        const selected = new Set(current[question._key] || [])
        if (checked) selected.add(optionKey)
        else selected.delete(optionKey)
        return { ...current, [question._key]: [...selected] }
      }
      return { ...current, [question._key]: [optionKey] }
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = await lmsApi(`${endpoint}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      })
      setResult(payload.attempt)
      if (payload.attempt.passed) onPassed?.(payload)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (locked) {
    return <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 font-bold leading-6 text-gray-500 sm:items-center sm:p-5"><Lock className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0" />Complete all lessons to unlock the final assessment.</div>
  }
  if (loading) return <div className="rounded-2xl bg-gray-50 p-5 font-semibold text-gray-500">Loading assessment...</div>
  if (!assessment) return <div className="rounded-2xl bg-red-50 p-5 font-semibold text-red-700">{error || 'Assessment unavailable.'}</div>

  return (
    <section className="min-w-0 rounded-2xl border border-primary-100 bg-white p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="mt-1 h-6 w-6 shrink-0 text-primary-600" />
        <div className="min-w-0">
          <h2 className="break-words text-lg font-black text-gray-950 sm:text-xl">{assessment.title}</h2>
          {assessment.instructions && <p className="mt-2 leading-7 text-gray-600">{assessment.instructions}</p>}
          <p className="mt-2 text-sm font-semibold text-gray-500">
            Pass mark: {assessment.passingPercentage}%
            {assessment.maxAttempts ? ` · ${Math.max(0, assessment.maxAttempts - assessment.attemptsUsed)} attempts remaining` : ' · Unlimited attempts'}
          </p>
        </div>
      </div>

      {result?.passed ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 font-black text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          Passed with {result.score}%
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7 space-y-7">
          {assessment.questions.map((question, index) => (
            <fieldset key={question._key} className="min-w-0">
              <legend className="break-words font-black leading-6 text-gray-950">{index + 1}. {question.prompt}</legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const selected = answers[question._key] || []
                  const multiple = question.questionType === 'multipleChoice'
                  return (
                    <label key={option._key} className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-gray-200 px-3 py-3 hover:bg-gray-50 sm:px-4">
                      <input
                        type={multiple ? 'checkbox' : 'radio'}
                        name={question._key}
                        checked={selected.includes(option._key)}
                        onChange={(event) => selectAnswer(question, option._key, event.target.checked)}
                        className="mt-1 h-4 w-4 accent-primary-600"
                      />
                      <span className="min-w-0 break-words text-sm font-semibold leading-5 text-gray-800">{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}

          {result && !result.passed && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 font-bold text-amber-800">
              <RotateCcw className="h-5 w-5" />
              Score: {result.score}%. Review the lesson and try again.
            </div>
          )}
          {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
          <button disabled={submitting} type="submit" className="w-full rounded-xl bg-primary-600 px-5 py-3 font-black text-white disabled:opacity-50 sm:w-auto">
            {submitting ? 'Checking answers...' : 'Submit assessment'}
          </button>
        </form>
      )}
    </section>
  )
}
