'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'

interface Service {
  id: string
  name: string
  description?: string
  base_price: number
  price_unit: string
}

interface ServiceManagementProps {
  companyId: string
  companyName: string
  services: Service[]
  onServicesChange: (services: Service[]) => void
}

export function ServiceManagement({ companyId, companyName, services, onServicesChange }: ServiceManagementProps) {
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    base_price: '',
    price_unit: 'per_service'
  })

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      base_price: '',
      price_unit: 'per_service'
    })
    setEditingService(null)
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const serviceData = {
      name: serviceForm.name,
      description: serviceForm.description || null,
      base_price: parseFloat(serviceForm.base_price),
      price_unit: serviceForm.price_unit
    }

    try {
      let response
      if (editingService) {
        // Update existing service
        response = await fetch(`/api/admin/companies/${companyId}/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        })
      } else {
        // Create new service
        response = await fetch(`/api/admin/companies/${companyId}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        })
      }

      if (response.ok) {
        const updatedService = await response.json()
        
        if (editingService) {
          // Update existing service in the list
          const updatedServices = services.map(service => 
            service.id === editingService.id ? updatedService.service : service
          )
          onServicesChange(updatedServices)
        } else {
          // Add new service to the list
          onServicesChange([...services, updatedService.service])
        }
        
        setShowServiceModal(false)
        resetServiceForm()
      } else {
        const errorData = await response.json()
        alert(`Error saving service: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price.toString(),
      price_unit: service.price_unit
    })
    setShowServiceModal(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const updatedServices = services.filter(service => service.id !== serviceId)
        onServicesChange(updatedServices)
      } else {
        const errorData = await response.json()
        alert(`Error deleting service: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Network error. Please try again.')
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Services for {companyName}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage services and pricing for this company
              </p>
            </div>
            <Button
              onClick={() => {
                resetServiceForm()
                setShowServiceModal(true)
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No services added yet</p>
              <Button
                onClick={() => {
                  resetServiceForm()
                  setShowServiceModal(true)
                }}
                variant="outline"
                size="sm"
              >
                Add First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {service.price_unit.replace('_', ' ')}
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Modal */}
      <Modal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false)
          resetServiceForm()
        }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        description={`${editingService ? 'Update' : 'Add'} a service for ${companyName}`}
        size="md"
      >
        <form onSubmit={handleServiceSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Name *
            </label>
            <Input
              type="text"
              required
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              placeholder="e.g., Garage Door Installation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
              placeholder="Describe what this service includes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={serviceForm.base_price}
                onChange={(e) => setServiceForm({ ...serviceForm, base_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Unit *
              </label>
              <select
                value={serviceForm.price_unit}
                onChange={(e) => setServiceForm({ ...serviceForm, price_unit: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="per_service">Per Service</option>
                <option value="per_hour">Per Hour</option>
                <option value="per_sqft">Per Square Foot</option>
                <option value="per_day">Per Day</option>
                <option value="per_week">Per Week</option>
                <option value="per_month">Per Month</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit">
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowServiceModal(false)
                resetServiceForm()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
