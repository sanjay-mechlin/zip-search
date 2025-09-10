'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, Phone, Mail, Globe, Star, Clock, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from '@/components/theme-provider'

interface Company {
  id: string
  name: string
  description?: string
  phone: string
  email: string
  website?: string
  address: string
  city: string
  state: string
  company_services: CompanyService[]
}

interface CompanyService {
  id: string
  company_id: string
  service_id: string
  custom_price?: number
  is_available: boolean
  service: {
    id: string
    name: string
    description?: string
    base_price: number
    price_unit: string
    category: string
  }
}


export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [zipCode, setZipCode] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme } = useTheme()

  // Search function that can be called directly
  const searchCompanies = async (zip: string) => {
    if (!zip.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/companies?zip=${zip}&category=garage_doors`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch companies')
      }

      setCompanies(data.companies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  // Initialize from URL parameters
  useEffect(() => {
    const zipFromUrl = searchParams.get('zip')
    if (zipFromUrl) {
      setZipCode(zipFromUrl)
      // Auto-search if there's a zip in URL
      searchCompanies(zipFromUrl)
    }
  }, [searchParams])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!zipCode.trim()) return

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('zip', zipCode)
    router.push(`/?${params.toString()}`, { scroll: false })

    // Perform search
    await searchCompanies(zipCode)
  }

  const clearSearch = () => {
    setZipCode('')
    setCompanies([])
    setError('')
    router.push('/', { scroll: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/40 dark:border-slate-700/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LocalService
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Find Trusted Local
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Service Providers</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with verified local service companies. Compare prices, read reviews, and book services in your area.
            </p>
          </div>
          
          {/* Search Section - Prominent */}
          <Card className="max-w-3xl mx-auto mb-8 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="Enter your ZIP code (e.g., 90210)"
                      className="pl-12 pr-12 h-14 text-lg border-2 focus:border-blue-500"
                    />
                    {zipCode && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || !zipCode.trim()}
                  size="lg"
                  className="h-14 px-8 text-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  {loading ? 'Searching...' : 'Find Services'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Verified Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Cities Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4.8★</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Error Message */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-8">
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {companies.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {companies.length} Companies Found in {zipCode}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Verified local service providers ready to help</p>
            </div>
            
            {/* Company Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id} className="group hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {company.name}
                        </CardTitle>
                        {company.description && (
                          <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-300 text-sm">
                            {company.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        4.8
                      </Badge>
                    </div>
                    
                    {/* Quick Contact */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${company.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {company.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{company.city}, {company.state}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Services Preview */}
                    {company.company_services && company.company_services.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Services Available</h5>
                        <div className="space-y-2">
                          {company.company_services?.slice(0, 2).map((companyService) => (
                            <div key={companyService.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{companyService.service.name}</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                ${companyService.custom_price || companyService.service.base_price}
                                {companyService.service.price_unit === 'per_hour' && '/hr'}
                                {companyService.service.price_unit === 'per_sqft' && '/sqft'}
                              </span>
                            </div>
                          ))}
                          {company.company_services.length > 2 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                              +{company.company_services.length - 2} more services
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Link href={`/company/${company.id}`}>
                        <Button className="w-full group-hover:bg-blue-700 transition-colors">
                          View Full Details
                        </Button>
                      </Link>
                      <div className="flex gap-2">
                        <a href={`tel:${company.phone}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </a>
                        <a href={`mailto:${company.email}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {companies.length === 0 && !loading && zipCode && !error && (
          <Card className="text-center py-16 max-w-2xl mx-auto">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No companies found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                We couldn&apos;t find any garage door companies serving ZIP code {zipCode}. 
                Try a different ZIP code or check back later.
              </p>
              <Button 
                variant="outline" 
                onClick={clearSearch} 
                size="lg"
              >
                Try Different ZIP Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Finding Companies...</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Searching for garage door companies in {zipCode}
            </p>
          </div>
        )}

        {/* Empty State - No Search Yet */}
        {companies.length === 0 && !loading && !zipCode && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to Find Services?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Enter your ZIP code above to discover local garage door companies in your area.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}