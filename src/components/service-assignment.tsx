'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { SearchInput } from '@/components/ui/search-input'

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

interface ServiceAssignmentProps {
  companyId: string
  companyName: string
  assignedServices: CompanyService[]
  onServicesChange: (services: CompanyService[]) => void
}

export function ServiceAssignment({ companyId, companyName, assignedServices, onServicesChange }: ServiceAssignmentProps) {
  const [availableServices, setAvailableServices] = useState<GlobalService[]>([])
  const [filteredServices, setFilteredServices] = useState<GlobalService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assigningService, setAssigningService] = useState<string | null>(null)
  const [localAssignedServices, setLocalAssignedServices] = useState<CompanyService[]>(assignedServices)

  const fetchAvailableServices = async () => {
    try {
      const response = await fetch('/api/admin/global-services')
      const data = await response.json()
      setAvailableServices(data.services || [])
      setFilteredServices(data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter services based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(availableServices)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = availableServices.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      )
      setFilteredServices(filtered)
    }
  }, [searchQuery, availableServices])

  useEffect(() => {
    fetchAvailableServices()
  }, [])

  // Sync local state with prop changes
  useEffect(() => {
    setLocalAssignedServices(assignedServices)
  }, [assignedServices])

  const isServiceAssigned = (serviceId: string) => {
    return localAssignedServices.some(cs => cs.service_id === serviceId)
  }

  const handleAssignService = async (service: GlobalService) => {
    if (assigningService === service.id) return // Prevent double-clicks
    
    setAssigningService(service.id)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          custom_price: null,
          is_available: true
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        // Immediately update the local state and parent component's state
        const updatedAssignedServices = [...localAssignedServices, responseData.assignment]
        setLocalAssignedServices(updatedAssignedServices)
        onServicesChange(updatedAssignedServices)
      } else {
        const errorData = await response.json()
        if (response.status === 400 && errorData.error.includes('already assigned')) {
          // Service is already assigned, refresh the data to get the current state
          await fetchAvailableServices()
          // Also refresh the assigned services
          const response = await fetch(`/api/admin/companies/${companyId}/services`)
          if (response.ok) {
            const data = await response.json()
            onServicesChange(data.assignments || [])
          }
        } else {
          alert(`Error assigning service: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error assigning service:', error)
      alert('Network error. Please try again.')
    } finally {
      setAssigningService(null)
    }
  }

  const handleUnassignService = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/services/${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('Delete response:', responseData) // Debug log
        
        // Update the local state immediately for better UX
        const updatedServices = localAssignedServices.filter(cs => cs.id !== assignmentId)
        console.log('Updated services after delete:', updatedServices) // Debug log
        
        // Update local state first for immediate UI update
        setLocalAssignedServices(updatedServices)
        
        // Update parent component state
        onServicesChange(updatedServices)
        
        console.log('Service unassigned successfully')
      } else {
        const errorData = await response.json()
        alert(`Error unassigning service: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error unassigning service:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleToggleAvailability = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/services/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !currentStatus })
      })

      if (response.ok) {
        const updatedServices = localAssignedServices.map(cs => 
          cs.id === assignmentId 
            ? { ...cs, is_available: !currentStatus }
            : cs
        )
        setLocalAssignedServices(updatedServices)
        onServicesChange(updatedServices)
      } else {
        const errorData = await response.json()
        alert(`Error updating service: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Network error. Please try again.')
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Assigned Services for {companyName}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage which services this company offers
              </p>
            </div>
            <Button
              onClick={() => setShowAssignmentModal(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign Services
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {localAssignedServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No services assigned yet</p>
              <Button
                onClick={() => setShowAssignmentModal(true)}
                variant="outline"
                size="sm"
              >
                Assign Services
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {localAssignedServices.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{assignment.service.name}</h4>
                      <Badge variant={assignment.is_available ? "default" : "secondary"}>
                        {assignment.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {assignment.service.category}
                      </Badge>
                    </div>
                    {assignment.service.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{assignment.service.description}</p>
                    )}
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ${assignment.custom_price || assignment.service.base_price}
                      {assignment.service.price_unit === 'per_hour' && '/hr'}
                      {assignment.service.price_unit === 'per_sqft' && '/sqft'}
                      {assignment.service.price_unit === 'per_service' && ''}
                      {assignment.custom_price && (
                        <span className="text-xs text-gray-500 ml-1">
                          (base: ${assignment.service.base_price})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAvailability(assignment.id, assignment.is_available)}
                      className={assignment.is_available ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {assignment.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnassignService(assignment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        title="Assign Services"
        description={`Select services to assign to ${companyName}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search available services..."
              onClear={() => setSearchQuery('')}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No services found matching your search' : 'No services available'}
              </p>
            </div>
          ) : filteredServices.filter(service => !isServiceAssigned(service.id) && service.is_active).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? 'No unassigned services found matching your search' : 'All available services are already assigned to this company'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Try unassigning some services first, or add new services to the global catalog.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {filteredServices
                .filter(service => !isServiceAssigned(service.id) && service.is_active)
                .map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{service.description}</p>
                    )}
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ${service.base_price}
                      {service.price_unit === 'per_hour' && '/hr'}
                      {service.price_unit === 'per_sqft' && '/sqft'}
                      {service.price_unit === 'per_service' && ''}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAssignService(service)}
                    size="sm"
                    className="gap-2"
                    disabled={assigningService === service.id}
                  >
                    {assigningService === service.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
