"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign, Package } from "lucide-react";
import AdvancedSearch from "@/components/advanced-search";
import ServiceForm from "@/components/service-form";
import ConfirmationModal from "@/components/confirmation-modal";
const mockServices = [
  {
    id: 1,
    name: "Premium Haircut",
    description: "Professional haircut with styling and consultation",
    category: "Hair Services",
    duration: "60",
    price: 85,
    discount: 10,
    finalPrice: 76.5,
    isPrivate: false,
    status: "active",
  },
  {
    id: 2,
    name: "Hair Coloring",
    description: "Full hair coloring service with premium products",
    category: "Hair Services",
    duration: "120",
    price: 150,
    discount: 0,
    finalPrice: 150,
    isPrivate: false,
    status: "active",
  },
  {
    id: 3,
    name: "Luxury Manicure",
    description: "Complete manicure with nail art and premium polish",
    category: "Nail Services",
    duration: "45",
    price: 65,
    discount: 15,
    finalPrice: 55.25,
    isPrivate: false,
    status: "active",
  },
  {
    id: 4,
    name: "Deep Tissue Massage",
    description: "Therapeutic deep tissue massage for muscle relief",
    category: "Spa Services",
    duration: "90",
    price: 120,
    discount: 5,
    finalPrice: 114,
    isPrivate: true,
    status: "active",
  },
  {
    id: 5,
    name: "Bridal Makeup",
    description: "Complete bridal makeup package with trial session",
    category: "Beauty Services",
    duration: "180",
    price: 200,
    discount: 20,
    finalPrice: 160,
    isPrivate: true,
    status: "active",
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState(mockServices);
  const [filteredServices, setFilteredServices] = useState(mockServices);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<
    (typeof mockServices)[0] | null
  >(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    serviceId: number | null;
  }>({ isOpen: false, serviceId: null });

  const handleSearch = (filters: {
    searchTerm: string;
    category: string;
    status: string;
    priceRange: [number, number];
    duration: string;
    isPrivate: boolean | null;
    sortBy: string;
    sortOrder: string;
  }) => {
    let filtered = [...services];


    if (filters.searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          service.category
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
      );
    }


    if (filters.category) {
      filtered = filtered.filter(
        (service) => service.category === filters.category
      );
    }


    if (filters.status) {
      filtered = filtered.filter(
        (service) => service.status === filters.status
      );
    }


    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      filtered = filtered.filter(
        (service) =>
          service.finalPrice >= filters.priceRange[0] &&
          service.finalPrice <= filters.priceRange[1]
      );
    }


    if (filters.duration) {
      filtered = filtered.filter(
        (service) => service.duration === filters.duration
      );
    }


    if (filters.isPrivate !== null) {
      filtered = filtered.filter(
        (service) => service.isPrivate === filters.isPrivate
      );
    }


    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (filters.sortBy === "price") {
        aValue = a.finalPrice;
        bValue = b.finalPrice;
      } else if (filters.sortBy === "duration") {
        aValue = Number.parseInt(a.duration);
        bValue = Number.parseInt(b.duration);
      } else if (filters.sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {

        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredServices(filtered);
  };

  const handleResetSearch = () => {
    setFilteredServices(services);
  };

  const handleAddService = (formData: {
    name: string;
    description: string;
    category: string;
    duration: string;
    price: string;
    discount: string;
    isPrivate: boolean;
    finalPrice?: number;
  }) => {
    const newService = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      duration: formData.duration,
      price: Number.parseFloat(formData.price),
      discount: Number.parseFloat(formData.discount) || 0,
      finalPrice: formData.finalPrice || 0,
      isPrivate: formData.isPrivate,
      status: "active",
    };

    const updatedServices = [...services, newService];
    setServices(updatedServices);
    setFilteredServices(updatedServices);
    setIsAddDialogOpen(false);
  };

  const handleEditService = (service: (typeof mockServices)[0]) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = (formData: {
    name: string;
    description: string;
    category: string;
    duration: string;
    price: string;
    discount: string;
    isPrivate: boolean;
    finalPrice?: number;
  }) => {
    if (!editingService) return;

    const updatedService = {
      ...editingService,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      duration: formData.duration,
      price: Number.parseFloat(formData.price),
      discount: Number.parseFloat(formData.discount) || 0,
      finalPrice: formData.finalPrice || 0,
      isPrivate: formData.isPrivate,
    };

    const updatedServices = services.map((service) =>
      service.id === editingService.id ? updatedService : service
    );
    setServices(updatedServices);
    setFilteredServices(updatedServices);
    setIsEditDialogOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: number) => {
    setDeleteConfirmation({ isOpen: true, serviceId: id });
  };

  const confirmDeleteService = () => {
    if (deleteConfirmation.serviceId) {
      const updatedServices = services.filter(
        (service) => service.id !== deleteConfirmation.serviceId
      );
      setServices(updatedServices);
      setFilteredServices(updatedServices);
    }
    setDeleteConfirmation({ isOpen: false, serviceId: null });
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Service Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your services, pricing, and availability
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={handleAddService}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {}
      <AdvancedSearch
        onSearch={handleSearch}
        onReset={handleResetSearch}
        type="services"
      />

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {services.length}
                </p>
                <p className="text-xs text-green-600">
                  Showing {filteredServices.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Avg. Price</p>
                <p className="text-2xl font-bold text-blue-800">
                  Rs.
                  {(
                    filteredServices.reduce((sum, s) => sum + s.finalPrice, 0) /
                      filteredServices.length || 0
                  ).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Avg. Duration
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {Math.round(
                    filteredServices.reduce(
                      (sum, s) => sum + Number.parseInt(s.duration),
                      0
                    ) / filteredServices.length || 0
                  )}
                  m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Private Services
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {filteredServices.filter((s) => s.isPrivate).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/50"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {service.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {service.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {service.isPrivate && (
                    <Badge className="bg-purple-500 text-white text-xs">
                      Private
                    </Badge>
                  )}
                  <Badge className="bg-green-500 text-white text-xs">
                    {service.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {service.duration}m
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-600">
                      Rs.{service.finalPrice.toFixed(2)}
                    </span>
                    {service.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rs.{service.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {service.discount > 0 && (
                <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-red-700">
                      Discount Applied
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {service.discount}% OFF
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditService(service)}
                  className="flex-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteService(service.id)}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      {filteredServices.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No services found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search filters or create a new service.
          </p>
        </Card>
      )}

      {}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              initialData={{
                name: editingService.name,
                description: editingService.description,
                category: editingService.category,
                duration: editingService.duration,
                price: editingService.price.toString(),
                discount: editingService.discount.toString(),
                isPrivate: editingService.isPrivate,
              }}
              onSubmit={handleUpdateService}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingService(null);
              }}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, serviceId: null })
        }
        onConfirm={confirmDeleteService}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        type="danger"
        confirmText="Delete Service"
      />
    </div>
  );
}
