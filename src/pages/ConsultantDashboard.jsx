import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Award, BookOpen, BriefcaseBusiness, CalendarDays, FileText, Loader2, MapPin, UserRound, Users } from 'lucide-react'
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore'
import SEO from '../components/SEO'
import ConsultantDocuments from '../components/ConsultantDocuments'
import { getAuthUser, setAuthUser } from '../lib/auth'
import { subscribeConsultantOpportunities } from '../lib/dashboard'
import { db } from '../lib/firebase'
import { mentorClient } from '../lib/sanityClient'
import { getExpertImage } from '../lib/expertImages'

function formatDate(date) {
  if (!date) return 'Not scheduled'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getDashboardError(error) {
  if (error?.code === 'permission-denied') {
    return 'Firestore permissions are blocking consultant opportunities. Allow consultants to read briefs assigned to their uid.'
  }

  return error?.message || 'Unable to load consultant dashboard data right now.'
}

export default function ConsultantDashboard() {
  const [user, setUser] = useState(() => getAuthUser())
  const [activeView, setActiveView] = useState('profile')
  const [expert, setExpert] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
    { id: 'mou', label: 'Documents', icon: FileText },
  ]

  useEffect(() => {
    const localUser = getAuthUser()

    if (!localUser?.email) {
      setUser(localUser)
      setProfileLoading(false)
      return undefined
    }

    const consultantProfileQuery = query(
      collection(db, 'users'),
      where('email', '==', localUser.email),
      limit(1)
    )

    const unsubscribe = onSnapshot(
      consultantProfileQuery,
      (snapshot) => {
        const profileDocument = snapshot.docs[0]
        const profile = profileDocument?.data() || {}
        const updatedUser = {
          ...localUser,
          ...profile,
          uid: localUser.uid,
          consultantUserId: profileDocument?.id || localUser.consultantUserId || '',
          email: profile.email || localUser.email || '',
          name: profile.name || localUser.name || '',
          role: profile.role || localUser.role || 'client',
          sanityExpertId: profile.sanityExpertId || localUser.sanityExpertId || '',
        }

        setUser(updatedUser)
        setAuthUser(updatedUser)
      },
      (profileError) => {
        console.warn('Consultant profile listener failed:', profileError)
        setUser(localUser)
      }
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchExpertProfile = async () => {
      if (!user?.sanityExpertId) {
        setExpert(null)
        setProfileLoading(false)
        setProfileError('No Sanity expert profile is linked to this consultant account yet.')
        return
      }

      setProfileLoading(true)
      setProfileError('')

      try {
        const query = `*[_type == "mentor" && _id == $expertId][0] {
          _id,
          fullName,
          "slug": slug.current,
          headline,
          "imageUrl": profileImage.asset->url,
          currentDesignation,
          currentCompany,
          location,
          availabilityStatus,
          totalYearsOfExperience,
          shortBio,
          profileIntro,
          keySkills,
          experience[]{
            roleTitle,
            companyName,
            employmentType,
            location,
            startDate,
            endDate,
            currentlyWorkingHere
          },
          education[]{
            schoolName,
            degree,
            fieldOfStudy,
            startDate,
            endDate
          }
        }`

        const data = await mentorClient.fetch(query, { expertId: user.sanityExpertId.trim() })
        setExpert(data)
        setProfileError(data ? '' : 'The linked Sanity expert profile was not found.')
      } catch (fetchError) {
        console.error('Error fetching consultant Sanity profile:', fetchError)
        setProfileError('Unable to load your Sanity profile right now.')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchExpertProfile()
  }, [user?.sanityExpertId])

  useEffect(() => {
    let unsubscribe = null

    try {
      unsubscribe = subscribeConsultantOpportunities(
        (items) => {
          setOpportunities(items)
          setLoading(false)
          setError('')
        },
        (dashboardError) => {
          setError(getDashboardError(dashboardError))
          setLoading(false)
        }
      )
    } catch (dashboardError) {
      setError(getDashboardError(dashboardError))
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [])

  const stats = useMemo(() => ({
    opportunities: opportunities.length,
    scheduled: opportunities.filter((item) => item.status === 'scheduled').length,
    active: opportunities.filter((item) => item.status === 'active').length,
  }), [opportunities])

  return (
    <div className="min-h-screen bg-[#f7f9ff] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <SEO title="Consultant Dashboard" description="Magnafic consultant dashboard." path="/dashboard/consultant" noIndex />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-600">Consultant Dashboard</p>
          <h1 className="mt-3 break-words text-3xl font-bold text-gray-950 sm:text-4xl">
            Welcome{expert?.fullName || user?.name || user?.email ? `, ${expert?.fullName || user?.name || user?.email}` : ''}
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">Manage your profile and assigned opportunities from one dashboard.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-2xl bg-white p-3 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeView === item.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/15'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {activeView === 'profile' && (
              <section className="rounded-3xl bg-white p-4 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-950">Profile</h2>
                  </div>
                  {profileLoading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                </div>

                {profileError && (
                  <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{profileError}</p>
                  </div>
                )}

                {!profileLoading && expert && (
                  <div>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-100 text-3xl font-bold text-primary-700">
                        {getExpertImage(expert) ? (
                          <img src={getExpertImage(expert)} alt={expert.fullName} className="h-full w-full object-cover" />
                        ) : (
                          expert.fullName?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="break-words text-3xl font-bold text-gray-950">{expert.fullName}</h3>
                        <p className="mt-2 text-lg font-semibold text-primary-700">{expert.headline || expert.currentDesignation || 'Consultant'}</p>
                        {(expert.currentCompany || expert.location) && (
                          <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-gray-600">
                            {expert.currentCompany && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                                <BriefcaseBusiness className="h-4 w-4" />
                                {expert.currentCompany}
                              </span>
                            )}
                            {expert.location && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                                <MapPin className="h-4 w-4" />
                                {expert.location}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {(expert.profileIntro || expert.shortBio) && (
                      <p className="mt-8 text-base leading-7 text-gray-700">{expert.profileIntro || expert.shortBio}</p>
                    )}

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-2xl font-bold text-gray-950">{expert.totalYearsOfExperience || '-'}</p>
                        <p className="mt-1 text-sm font-medium text-gray-500">Years experience</p>
                      </div>
                    </div>

                    {expert.keySkills?.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-lg font-bold text-gray-950">Key skills</h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {expert.keySkills.map((skill) => (
                            <span key={skill} className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {activeView === 'opportunities' && (
              <>
                {error && (
                  <div className="mb-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { icon: Users, label: 'Assigned opportunities', value: stats.opportunities },
                    { icon: CalendarDays, label: 'Scheduled calls', value: stats.scheduled },
                    { icon: Award, label: 'Active workspaces', value: stats.active },
                    { icon: BookOpen, label: 'Knowledge assets', value: 0 },
                  ].map(item => (
                    <section key={item.label} className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100">
                      <item.icon className="mb-5 h-7 w-7 text-primary-600" />
                      <p className="text-3xl font-bold text-gray-950">{loading ? '-' : item.value}</p>
                      <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
                    </section>
                  ))}
                </div>

                <section className="mt-8 rounded-3xl bg-white p-5 shadow-xl shadow-primary-900/5 ring-1 ring-gray-100 sm:p-8">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-950">Assigned opportunities</h2>
                      <p className="mt-2 max-w-3xl text-gray-600">Briefs appear here when their `assignedConsultantId` matches your Firebase uid.</p>
                    </div>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-primary-600" />}
                  </div>

                  {!loading && opportunities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                      <Users className="mx-auto mb-4 h-10 w-10 text-primary-500" />
                      <h3 className="text-lg font-bold text-gray-950">No assigned opportunities yet</h3>
                      <p className="mt-2 text-sm text-gray-600">Approved consultant assignments will appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {opportunities.map((item) => (
                        <article key={item.id} className="rounded-2xl border border-gray-100 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-bold text-gray-950">{item.title}</h3>
                              <p className="mt-1 text-sm font-medium text-primary-700">{item.capability}</p>
                            </div>
                            <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                              {item.status || 'assigned'}
                            </span>
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{item.description}</p>
                          <p className="mt-4 text-xs font-medium text-gray-500">Created: {formatDate(item.createdAtDate)}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {activeView === 'mou' && (
              <ConsultantDocuments user={user} expert={expert} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
