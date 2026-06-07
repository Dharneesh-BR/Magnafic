import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import SEO from '../components/SEO'
import { mentorClient } from '../lib/sanityClient'
import { PROBLEM_ANSWERS_KEY, REFERRED_EXPERT_KEY } from '../lib/dashboard'

export default function DescribeProblem() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestionId, setCurrentQuestionId] = useState('')
  const [questionHistory, setQuestionHistory] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      setError('')

      try {
        const query = `*[_type == "problemQuestion" && isActive != false] | order(displayOrder asc) {
          _id,
          question,
          "questionKey": questionKey.current,
          isStartQuestion,
          helperText,
          displayOrder,
          options[]{
            label,
            value,
            routeTag,
            capability->{
              _id,
              "slug": slug.current,
              title
            },
            nextQuestion->{
              _id
            }
          }
        }`

        const data = await mentorClient.fetch(query)
        const activeQuestions = (data || []).filter(item => item?.question && item?.options?.length)
        const startQuestion = activeQuestions.find(question => question.isStartQuestion) || activeQuestions[0]

        setQuestions(activeQuestions)
        setCurrentQuestionId(startQuestion?._id || '')
      } catch (fetchError) {
        console.error('Error fetching problem questions:', fetchError)
        setError('We could not load the questions right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const currentQuestion = questions.find(question => question._id === currentQuestionId)
  const selectedAnswer = currentQuestion ? answers[currentQuestion._id] : null
  const nextButtonLabel = selectedAnswer?.nextQuestionId || !selectedAnswer ? 'Next' : 'Complete'
  const progress = useMemo(() => {
    if (!questions.length) return 0
    return Math.min(((questionHistory.length + (currentQuestion ? 1 : 0)) / questions.length) * 100, 100)
  }, [currentQuestion, questionHistory.length, questions.length])

  const selectOption = (option) => {
    setAnswers(current => ({
      ...current,
      [currentQuestion._id]: {
        questionId: currentQuestion._id,
        question: currentQuestion.question,
        label: option.label,
        value: option.value || option.label,
        routeTag: option.routeTag || '',
        capability: option.capability || null,
        nextQuestionId: option.nextQuestion?._id || '',
      },
    }))
  }

  const goNext = () => {
    if (!selectedAnswer) return

    if (!selectedAnswer.nextQuestionId) {
      localStorage.setItem(PROBLEM_ANSWERS_KEY, JSON.stringify(Object.values({
        ...answers,
        [currentQuestion._id]: selectedAnswer,
      })))
      localStorage.setItem(REFERRED_EXPERT_KEY, 'Magnafic Consultant')
      navigate('/signup')
      return
    }

    setQuestionHistory(history => [...history, currentQuestion._id])
    setCurrentQuestionId(selectedAnswer.nextQuestionId)
  }

  const goBack = () => {
    const previousQuestionId = questionHistory[questionHistory.length - 1]
    if (!previousQuestionId) return

    setQuestionHistory(history => history.slice(0, -1))
    setCurrentQuestionId(previousQuestionId)
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Describe Your Problem" description="Answer a few questions so Magnafic can understand your business challenge." path="/describe-your-problem" noIndex />

      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center text-sm font-semibold text-primary-700 transition hover:text-primary-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <section className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary-900/10 ring-1 ring-gray-100">
          <div className="bg-[#000047] px-5 py-7 text-white sm:px-8 sm:py-10">
            <div className="mb-5 flex justify-center">
              <img src="/favicon.png" alt="Magnafic" className="h-12 w-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Describe your problem
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg">
              Answer a few quick questions so we can understand your business challenge before starting the conversation.
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {loading && (
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-primary-50 px-4 py-8 text-primary-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">Loading questions...</span>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl bg-red-50 px-4 py-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && questions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <h2 className="text-xl font-bold text-gray-950">No questions available yet</h2>
                <p className="mt-2 text-gray-600">Add active questions in Sanity to enable this flow.</p>
              </div>
            )}

            {!loading && !error && currentQuestion && (
              <div>
                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between gap-4 text-sm font-semibold text-gray-500">
                    <span>Question {questionHistory.length + 1}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold leading-tight text-gray-950 sm:text-3xl">{currentQuestion.question}</h2>
                {currentQuestion.helperText && (
                  <p className="mt-3 text-base leading-7 text-gray-600">{currentQuestion.helperText}</p>
                )}

                <div className="mt-8 grid gap-3">
                  {currentQuestion.options.map((option) => {
                    const optionValue = option.value || option.label
                    const isSelected = selectedAnswer?.value === optionValue

                    return (
                      <button
                        key={optionValue}
                        type="button"
                        onClick={() => selectOption(option)}
                        className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left font-semibold transition ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-800 ring-2 ring-primary-100'
                            : 'border-gray-200 bg-white text-gray-800 hover:border-primary-200 hover:bg-primary-50/50'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" />}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={questionHistory.length === 0}
                    className="rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!selectedAnswer}
                    className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {nextButtonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  )
}
