'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Mail, Globe, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Modal } from '@/components/ui/modal'
import { SearchInput } from '@/components/ui/search-input'
import { ServiceAssignment } from '@/components/service-assignment'
import { GlobalServicesManagement } from '@/components/global-services-management'

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
  zip_codes: string[]
  service_category: string
  company_services: CompanyService[]
}

interface GlobalService {
  id: string
  name: string
  description?: string
  base_price: number
  price_unit: string
  category: string
  is_active: boolean
}

interface CompanyService {
  id: string
  company_id: string
  service_id: string
  custom_price?: number
  is_available: boolean
  service: GlobalService
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [managingServices, setManagingServices] = useState<Company | null>(null)
  const [showGlobalServices, setShowGlobalServices] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_codes: '',
    service_category: 'garage_doors'
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      const data = await response.json()
      setCompanies(data.companies || [])
      setFilteredCompanies(data.companies || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter companies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = companies.filter(company => {
        // Basic company fields
        const basicMatch = 
          company.name.toLowerCase().includes(query) ||
          company.city.toLowerCase().includes(query) ||
          company.state.toLowerCase().includes(query) ||
          company.email.toLowerCase().includes(query) ||
          company.phone.includes(query) ||
          company.address.toLowerCase().includes(query) ||
          company.service_category.toLowerCase().includes(query) ||
          (company.description && company.description.toLowerCase().includes(query)) ||
          (company.website && company.website.toLowerCase().includes(query))

        // ZIP codes match
        const zipMatch = company.zip_codes.some(zip => 
          zip.toLowerCase().includes(query)
        )

        // Services match
        const servicesMatch = company.company_services?.some(companyService =>
          companyService.service.name.toLowerCase().includes(query) ||
          (companyService.service.description && companyService.service.description.toLowerCase().includes(query)) ||
          companyService.service.price_unit.toLowerCase().includes(query) ||
          companyService.service.base_price.toString().includes(query)
        ) || false

        return basicMatch || zipMatch || servicesMatch
      })
      setFilteredCompanies(filtered)
    }
  }, [searchQuery, companies])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (submitting) return // Prevent double submission
    
    setSubmitting(true)
    
    const companyData = {
      ...formData,
      zip_codes: formData.zip_codes.split(',').map(zip => zip.trim())
    }

    try {
      let response
      if (editingCompany) {
        response = await fetch(`/api/admin/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        })
      } else {
        response = await fetch('/api/admin/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companyData)
        })
      }

      if (response.ok) {
        // Success - close modal and refresh data
        setShowAddForm(false)
        setEditingCompany(null)
        resetForm()
        await fetchCompanies() // Wait for refresh to complete
        console.log('Company saved successfully!')
      } else {
        // Handle API errors
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Error saving company: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      description: company.description || '',
      phone: company.phone,
      email: company.email,
      website: company.website || '',
      address: company.address,
      city: company.city,
      state: company.state,
      zip_codes: company.zip_codes.join(', '),
      service_category: company.service_category
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return

    try {
      const response = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        await fetchCompanies() // Wait for refresh to complete
        console.log('Company deleted successfully!')
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Error deleting company: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Network Error:', error)
      alert('Network error. Please check your connection and try again.')
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingCompany(null)
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zip_codes: '',
      service_category: 'garage_doors'
    })
  }

  const handleServicesChange = (companyId: string, updatedServices: CompanyService[]) => {
    console.log('handleServicesChange called for company:', companyId, 'with services:', updatedServices) // Debug log
    setCompanies(prevCompanies => 
      prevCompanies.map(company => 
        company.id === companyId 
          ? { ...company, company_services: updatedServices }
          : company
      )
    )
    setFilteredCompanies(prevFiltered => 
      prevFiltered.map(company => 
        company.id === companyId 
          ? { ...company, company_services: updatedServices }
          : company
      )
    )
    console.log('State updated for company:', companyId) // Debug log
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/40 dark:border-slate-700/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage companies and services</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                onClick={() => setShowGlobalServices(true)} 
                variant="outline"
                className="gap-2"
              >
                Manage Services
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {filteredCompanies.length} of {companies.length} companies
              </p>
            </div>
            <div className="w-80">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search companies, services, locations, contact info..."
                onClear={() => setSearchQuery('')}
              />
              {searchQuery && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Searching in: name, description, contact info, location, services, pricing, ZIP codes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false)
            setEditingCompany(null)
            resetForm()
          }}
          title={editingCompany ? 'Edit Company' : 'Add New Company'}
          description={editingCompany ? 'Update company information and services' : 'Add a new service company to the platform'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Category
                  </label>
                  <select
                    value={formData.service_category}
                    onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="garage_doors">Garage Doors</option>
                    <option value="hvac">HVAC</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Codes (comma-separated) *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.zip_codes}
                  onChange={(e) => setFormData({ ...formData, zip_codes: e.target.value })}
                  placeholder="90210, 90211, 90212"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingCompany ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingCompany ? 'Update Company' : 'Add Company'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={submitting}
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingCompany(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
        </Modal>

        {/* Companies List */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No companies found' : 'No companies yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms' 
                      : 'Get started by adding your first company'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Company
                    </Button>
                  )}
                </div>
              ) : (
                filteredCompanies.map((company) => (
                <Card key={company.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{company.name}</h3>
                            {company.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-3">{company.description}</p>
                            )}
                            <div className="flex items-center gap-4 mb-4">
                              <Badge variant="secondary" className="capitalize">
                                {company.service_category.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">
                                {company.company_services?.length || 0} Services
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">{company.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">{company.email}</span>
                            </div>
                            {company.website && (
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium">
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{company.address}, {company.city}, {company.state}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">ZIP Codes:</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{company.zip_codes.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        {company.company_services && company.company_services.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Services ({company.company_services.length})</h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              {company.company_services.map((companyService) => (
                                <div key={companyService.id} className="flex justify-between items-center text-sm bg-muted/50 dark:bg-gray-700/50 rounded-md p-3">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{companyService.service.name}</span>
                                  <span className="font-semibold text-primary">
                                    ${companyService.custom_price || companyService.service.base_price}
                                    {companyService.service.price_unit === 'per_hour' && '/hr'}
                                    {companyService.service.price_unit === 'per_sqft' && '/sqft'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setManagingServices(company)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Assign Services
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(company)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(company.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Service Assignment Modal */}
      {managingServices && (
        <Modal
          isOpen={!!managingServices}
          onClose={() => setManagingServices(null)}
          title={`Assign Services - ${managingServices.name}`}
          description="Assign services from the global service catalog to this company"
          size="xl"
        >
          <ServiceAssignment
            companyId={managingServices.id}
            companyName={managingServices.name}
            assignedServices={managingServices.company_services || []}
            onServicesChange={(updatedServices) => 
              handleServicesChange(managingServices.id, updatedServices)
            }
          />
        </Modal>
      )}

      {/* Global Services Management Modal */}
      <GlobalServicesManagement
        isOpen={showGlobalServices}
        onClose={() => setShowGlobalServices(false)}
      />
    </div>
  )
}
