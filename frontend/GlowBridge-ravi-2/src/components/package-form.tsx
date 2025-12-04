"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Calculator, Package, Loader2 } from "lucide-react";
import {
  fetchServicesBySalon,
  fetchActiveCategories,
  Service,
  Category,
} from "@/lib/categoryApi";
import { showApiErrorToast } from "@/lib/errorToast";

interface PackageData {
  name: string;
  description: string;
  services: string[];
  selectedServices: string[];
  discount: string;
  isPrivate: boolean;
  totalPrice?: number;
  finalPrice?: number;
}

interface PackageFormProps {
  initialData?: {
    name: string;
    description: string;
    services: string[];
    discount: string;
    isPrivate: boolean;
  };
  onSubmit: (data: PackageData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}
const SALON_ID = "1df3195c-05b9-43c9-bebd-79d8684cbf55";

export default function PackageForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
}: PackageFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    selectedServices: initialData?.services || [],
    discount: initialData?.discount || "",
    isPrivate: initialData?.isPrivate || false,
  });


  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        selectedServices: initialData.services || [],
        discount: initialData.discount || "",
        isPrivate: initialData.isPrivate || false,
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let servicesData;
        try {
          servicesData = await fetchServicesBySalon(SALON_ID);
        } catch {

          const { fetchServices } = await import("@/lib/categoryApi");
          const allServicesResponse = await fetchServices(1, 100);
          servicesData = allServicesResponse.services;
        }

        const categoriesData = await fetchActiveCategories();

        setAvailableServices(servicesData);
        setCategories(categoriesData.categories);
      } catch (error) {
        showApiErrorToast(error, "Failed to load services and categories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {

    const selectedServiceObjects = availableServices.filter((service) =>
      formData.selectedServices.includes(service.id)
    );
    const total = selectedServiceObjects.reduce(
      (sum, service) => sum + service.price,
      0
    );
    setTotalPrice(total);


    const discount = Number.parseFloat(formData.discount) || 0;
    const calculated = total - (total * discount) / 100;
    setFinalPrice(calculated);
  }, [formData.selectedServices, formData.discount, availableServices]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Package name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.selectedServices || formData.selectedServices.length === 0) {
      newErrors.services = "At least one service must be selected";
    }

    if (
      !formData.discount ||
      Number.parseFloat(formData.discount) < 0 ||
      Number.parseFloat(formData.discount) > 50
    ) {
      newErrors.discount = "Discount must be between 0 and 50%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        services: formData.selectedServices,
        totalPrice,
        finalPrice,
      });
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const updatedServices = checked
      ? [...formData.selectedServices, serviceId]
      : formData.selectedServices.filter((s) => s !== serviceId);

    setFormData({ ...formData, selectedServices: updatedServices });
    clearError("services");
  };


  const servicesByCategory = categories.reduce((acc, category) => {
    const servicesInCategory = availableServices.filter((service) =>
      service.categories.some((cat) => cat.id === category.id)
    );
    if (servicesInCategory.length > 0) {
      acc[category.name] = servicesInCategory;
    }
    return acc;
  }, {} as Record<string, Service[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-sm text-muted-foreground">
            Loading services and categories...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="package-name" className="text-sm font-medium">
            Package Name *
          </Label>
          <Input
            id="package-name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              clearError("name");
            }}
            placeholder="Enter package name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="package-description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="package-description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              clearError("description");
            }}
            placeholder="Enter package description"
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      {}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">
            Select Services to Include *
          </Label>
          {errors.services && (
            <p className="text-sm text-red-500 mt-1">{errors.services}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(servicesByCategory).length === 0 ? (
            <div className="col-span-full">
              {}
              {availableServices.length > 0 ? (
                <Card className="p-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">
                    Available Services ({availableServices.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.selectedServices.includes(
                            service.id
                          )}
                          onCheckedChange={(checked) =>
                            handleServiceToggle(service.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`service-${service.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {service.name}
                          </Label>
                          <p className="text-xs text-green-600 font-medium">
                            Rs. {service.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-2">
                    No services available for this salon.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please add services to this salon first.
                  </p>
                </div>
              )}
            </div>
          ) : (
            Object.entries(servicesByCategory).map(([category, services]) => (
              <Card key={category} className="p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-3">
                  {category} ({services.length} services)
                </h4>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={formData.selectedServices.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleServiceToggle(service.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {service.name}
                        </Label>
                        <p className="text-xs text-green-600 font-medium">
                          Rs. {service.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {}
      {formData.selectedServices.length > 0 && (
        <div>
          <Label htmlFor="package-discount" className="text-sm font-medium">
            Discount Percentage (%)
          </Label>
          <Input
            id="package-discount"
            type="number"
            value={formData.discount}
            onChange={(e) => {
              setFormData({ ...formData, discount: e.target.value });
              clearError("discount");
            }}
            placeholder="0"
            min="0"
            max="50"
            className={errors.discount ? "border-red-500" : ""}
          />
          {errors.discount && (
            <p className="text-sm text-red-500 mt-1">{errors.discount}</p>
          )}
        </div>
      )}

      {}
      {formData.selectedServices.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Package Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">
                Total Service Price:
              </span>
              <span className="font-medium text-green-800">
                Rs. {totalPrice.toFixed(2)}
              </span>
            </div>
            {formData.discount && Number.parseFloat(formData.discount) > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">
                    Package Discount ({formData.discount}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -Rs.
                    {(
                      (totalPrice * Number.parseFloat(formData.discount)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">
                    Customer Saves:
                  </span>
                  <span className="font-bold text-green-600">
                    Rs. {(totalPrice - finalPrice).toFixed(2)}
                  </span>
                </div>
                <hr className="border-green-200" />
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">
                Final Package Price:
              </span>
              <span className="text-lg font-bold text-green-800">
                Rs. {finalPrice.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {}
      <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <Switch
          id="package-private"
          checked={formData.isPrivate}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPrivate: checked })
          }
        />
        <div className="flex-1">
          <Label
            htmlFor="package-private"
            className="text-sm font-medium text-purple-700"
          >
            Private Package
          </Label>
          <p className="text-xs text-purple-600 mt-1">
            Private packages are only visible to selected customers
          </p>
        </div>
      </div>

      {}
      {formData.name && formData.selectedServices.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Live Preview</Label>
          <Card className="mt-2 overflow-hidden">
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                <Gift className="w-12 h-12 text-orange-600" />
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                {formData.isPrivate && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    Private
                  </Badge>
                )}
                <Badge className="bg-green-500 text-white text-xs">
                  active
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-orange-500 text-white font-semibold">
                  {formData.discount || 0}% OFF
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formData.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formData.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">
                    {formData.selectedServices.length} Services
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-600">
                      Rs. {finalPrice.toFixed(2)}
                    </span>
                    {formData.discount &&
                      Number.parseFloat(formData.discount) > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          Rs. {totalPrice.toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Included Services:
                </p>
                <div className="flex flex-wrap gap-1">
                  {formData.selectedServices
                    .slice(0, 3)
                    .map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                  {formData.selectedServices.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{formData.selectedServices.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-transparent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Package"
          ) : (
            "Create Package"
          )}
        </Button>
      </div>
    </form>
  );
}
