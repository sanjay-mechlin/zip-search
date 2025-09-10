'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Phone, Mail, Globe, ArrowLeft, Star, Clock, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

export default function CompanyPage() {
  const params = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch company')
        }

        setCompany(data.company)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCompany()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading company details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Company Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The company you&apos;re looking for doesn&apos;t exist.</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/40 dark:border-slate-700/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {company.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2 text-gray-900 dark:text-white">{company.name}</CardTitle>
                    {company.description && (
                      <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                        {company.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    4.8 Rating
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Quick Response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Licensed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services & Pricing */}
            {company.company_services && company.company_services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Services & Pricing</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Transparent pricing for all our services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {company.company_services.map((companyService) => (
                      <div key={companyService.id} className="border border-border dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-2xl transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{companyService.service.name}</h4>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">
                              ${companyService.custom_price || companyService.service.base_price}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              {companyService.service.price_unit === 'per_hour' && '/hr'}
                              {companyService.service.price_unit === 'per_sqft' && '/sqft'}
                              {companyService.service.price_unit === 'per_service' && ''}
                            </span>
                          </div>
                        </div>
                        {companyService.service.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{companyService.service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <a 
                    href={`tel:${company.phone}`} 
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {company.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <a 
                    href={`mailto:${company.email}`} 
                    className="text-primary hover:text-primary/80 font-medium truncate"
                  >
                    {company.email}
                  </a>
                </div>
                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {company.address}, {company.city}, {company.state}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Get in touch with {company.name} today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href={`tel:${company.phone}`}>
                  <Button className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </a>
                <a href={`mailto:${company.email}`}>
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full" size="lg">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-800 border-primary/20 dark:border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to Get Started?</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Contact {company.name} today for a free quote or to schedule your service. 
                Our team is ready to help you with all your garage door needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={`tel:${company.phone}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Phone className="h-4 w-4 mr-2" />
                    Call {company.phone}
                  </Button>
                </a>
                <a href={`mailto:${company.email}`}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
