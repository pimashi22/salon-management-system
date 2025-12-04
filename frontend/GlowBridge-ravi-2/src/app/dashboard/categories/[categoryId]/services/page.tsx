"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Package,
  ArrowLeft,
  Loader2,
  Search,
  X,
} from "lucide-react";
import ServiceForm from "@/components/service-form";
import ConfirmationModal from "@/components/confirmation-modal";
import { Pagination } from "@/shared/components/pagination";
import {
  fetchCategoryById,
  fetchServicesByCategory,
  createService,
  updateService,
  deleteService,
  Category,
  Service,
} from "@/lib/categoryApi";
import { showApiErrorToast } from "@/lib/errorToast";
const DEFAULT_SALON_ID = "1df3195c-05b9-43c9-bebd-79d8684cbf55";

export default function CategoryServicesPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    serviceId: string | null;
  }>({ isOpen: false, serviceId: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;


  const loadCategoryAndServices = useCallback(
    async (page: number = 1, search?: string) => {
      try {
        setLoading(true);


        const categoryData = await fetchCategoryById(categoryId);
        setCategory(categoryData);


        const servicesData = await fetchServicesByCategory(categoryId);


        let filteredData = servicesData;
        if (search) {
          filteredData = servicesData.filter(
            (service) =>
              service.name.toLowerCase().includes(search.toLowerCase()) ||
              service.description.toLowerCase().includes(search.toLowerCase())
          );
        }


        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedServices = filteredData.slice(startIndex, endIndex);

        setServices(servicesData);
        setFilteredServices(paginatedServices);
        setTotal(filteredData.length);
        setCurrentPage(page);
        setTotalPages(Math.ceil(filteredData.length / limit));
      } catch (error) {
        showApiErrorToast(error, "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [categoryId, limit]
  );


  useEffect(() => {
    loadCategoryAndServices(1);
  }, [categoryId, loadCategoryAndServices]);


  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    loadCategoryAndServices(1, searchTerm || undefined);
  }, [searchTerm, loadCategoryAndServices]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    loadCategoryAndServices(1);
  };


  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCategoryAndServices(page, searchTerm || undefined);
  };
  //Add service (create) flow
  const handleAddService = async (formData: {
    name: string;
    description: string;
    category: string;
    duration: string;
    price: string;
    discount: string;
    isPrivate: boolean;
    finalPrice?: number;
  }) => {
    try {
      setActionLoading(true);
      await createService({
        salon_id: DEFAULT_SALON_ID,
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: Number.parseFloat(formData.price) || 0,
        is_public: !formData.isPrivate,
        discount: Number.parseFloat(formData.discount) || 0,
        is_completed: false,
        category_ids: [Number.parseInt(categoryId)],
      });

      setIsAddDialogOpen(false);

      await loadCategoryAndServices(currentPage, searchTerm || undefined);
    } catch (error) {
      showApiErrorToast(error, "Failed to create service");
    } finally {
      setActionLoading(false);
    }
  };
  //Edit / Update flow
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async (formData: {
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

    try {
      setActionLoading(true);
      await updateService(editingService.id, {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: Number.parseFloat(formData.price) || 0,
        is_public: !formData.isPrivate,
        discount: Number.parseFloat(formData.discount) || 0,
        category_ids: [Number.parseInt(categoryId)],
      });

      setIsEditDialogOpen(false);
      setEditingService(null);

      await loadCategoryAndServices(currentPage, searchTerm || undefined);
    } catch (error) {
      showApiErrorToast(error, "Failed to update service");
    } finally {
      setActionLoading(false);
    }
  };

  //Delete flow
  const handleDeleteService = (id: string) => {
    setDeleteConfirmation({ isOpen: true, serviceId: id });
  };

  const confirmDeleteService = async () => {
    if (!deleteConfirmation.serviceId) return;

    try {
      setActionLoading(true);
      await deleteService(deleteConfirmation.serviceId);

      setDeleteConfirmation({ isOpen: false, serviceId: null });

      await loadCategoryAndServices(currentPage, searchTerm || undefined);
    } catch (error) {
      showApiErrorToast(error, "Failed to delete service");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">Loading services...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/categories")}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Categories
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {category.name} - Services
          </h1>
          <p className="text-muted-foreground mt-2">{category.description}</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>

          <Link
  href={`/dashboard/categories/${categoryId}/services/reports`}
  className="inline-block"
>
  <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg ml-3">
    <Package className="w-4 h-4 mr-2" />
    Generate Report
  </Button>
</Link>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service to {category.name}</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={handleAddService}
              onCancel={() => setIsAddDialogOpen(false)}
              prefilledCategory={category.name}
              isLoading={actionLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {services.length}
                </p>
                <p className="text-xs text-blue-600">
                  Showing {filteredServices.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                Rs
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Avg. Price</p>
                <p className="text-2xl font-bold text-green-800">
                  Rs.
                  {filteredServices.length > 0
                    ? (
                        filteredServices.reduce(
                          (sum, s) => sum + s.price * (1 - s.discount / 100),
                          0
                        ) / filteredServices.length
                      ).toFixed(0)
                    : 0}
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
                  {filteredServices.length > 0
                    ? Math.round(
                        filteredServices.reduce(
                          (sum, s) =>
                            sum +
                            Number.parseInt(
                              s.duration.replace(/\D/g, "") || "0"
                            ),
                          0
                        ) / filteredServices.length
                      )
                    : 0}
                  m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Private Services
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {filteredServices.filter((s) => !s.is_public).length}
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
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  {!service.is_public && (
                    <Badge className="bg-purple-500 text-white text-xs">
                      Private
                    </Badge>
                  )}
                  {service.is_public && (
                    <Badge className="bg-green-500 text-white text-xs">
                      Public
                    </Badge>
                  )}
                  {service.is_completed && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      Completed
                    </Badge>
                  )}
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
                    {service.duration}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-600">
                      Rs.
                      {(service.price * (1 - service.discount / 100)).toFixed(
                        2
                      )}
                    </span>
                    {service.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        Rs. {service.price.toFixed(2)}
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
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
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
      {filteredServices.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No services found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or create a new service for this category.
          </p>
        </Card>
      )}

      {}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        disabled={loading}
        itemLabel="services"
      />

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
                category: category.name,
                duration: editingService.duration,
                price: editingService.price.toString(),
                discount: editingService.discount.toString(),
                isPrivate: !editingService.is_public,
              }}
              onSubmit={handleUpdateService}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingService(null);
              }}
              isEditing={true}
              prefilledCategory={category.name}
              isLoading={actionLoading}
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
