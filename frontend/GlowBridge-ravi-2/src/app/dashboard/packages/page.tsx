"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Gift, Package as PackageIcon } from "lucide-react";
import PackageForm from "@/components/package-form";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  Package,
  fetchAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  ApiError,
} from "@/lib/packageApi";
import { showApiErrorToast } from "@/lib/errorToast";
import { Loader2 } from "lucide-react";
interface PackageFormData {
  name: string;
  description: string;
  selectedServices: string[];
  discount: string;
  isPrivate: boolean;
  totalPrice?: number;
  finalPrice?: number;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    packageId: string | null;
  }>({ isOpen: false, packageId: null });


  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const packagesData = await fetchAllPackages();
      setPackages(packagesData);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Failed to load packages";
      setError(errorMessage);
      showApiErrorToast(err as ApiError, "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (formData: PackageFormData) => {
    try {
      setCreateLoading(true);
      const newPackage = await createPackage({
        name: formData.name,
        description: formData.description,
        selectedServices: formData.selectedServices,
        isPrivate: formData.isPrivate,
        discount: formData.discount,
      });

      setPackages((prev) => [...prev, newPackage]);
      setIsAddDialogOpen(false);
    } catch (err) {
      showApiErrorToast(err as ApiError, "Failed to create package");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePackage = async (formData: PackageFormData) => {
    if (!editingPackage) return;

    try {
      setUpdateLoading(true);
      const updatedPackage = await updatePackage(editingPackage.id, {
        name: formData.name,
        description: formData.description,
        selectedServices: formData.selectedServices,
        isPrivate: formData.isPrivate,
        discount: formData.discount,
      });

      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === editingPackage.id ? updatedPackage : pkg))
      );
      setIsEditDialogOpen(false);
      setEditingPackage(null);
    } catch (err) {
      showApiErrorToast(err as ApiError, "Failed to update package");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeletePackage = (id: string) => {
    setDeleteConfirmation({ isOpen: true, packageId: id });
  };

  const confirmDeletePackage = async () => {
    if (!deleteConfirmation.packageId) return;

    try {
      await deletePackage(deleteConfirmation.packageId);
      setPackages((prev) =>
        prev.filter((pkg) => pkg.id !== deleteConfirmation.packageId)
      );
      setDeleteConfirmation({ isOpen: false, packageId: null });
    } catch (err) {
      showApiErrorToast(err as ApiError, "Failed to delete package");
      setDeleteConfirmation({ isOpen: false, packageId: null });
    }
  };

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.finalPrice, 0);

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Package Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage service packages with special pricing
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Package
            </Button>
          </DialogTrigger>

          <Link
            href={`/dashboard/packages/reports/`}
            className="inline-block"
          >
  <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg ml-3">
    
    Generate Report
  </Button>
</Link>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
            </DialogHeader>
            <PackageForm
              onSubmit={handleAddPackage}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={createLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Packages
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {packages.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Showing {packages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                Rs
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-foreground">
                  Rs.{totalRevenue.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Package revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <PackageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Services
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    packages.reduce((sum, p) => sum + p.serviceCount, 0) /
                      packages.length || 0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Per package</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      {loading && (
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Loading packages...
          </h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch your packages.
          </p>
        </Card>
      )}

      {}
      {error && !loading && (
        <Card className="p-12 text-center border-red-200 bg-red-50">
          <Gift className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Failed to load packages
          </h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button
            onClick={loadPackages}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Try Again
          </Button>
        </Card>
      )}

      {}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/50"
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={pkg.image || "/package.jpg"}
                  alt={pkg.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {pkg.isPrivate && (
                    <Badge className="bg-purple-500 text-white text-xs">
                      Private
                    </Badge>
                  )}
                  <Badge className="bg-green-500 text-white text-xs">
                    {pkg.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-blue-500 text-white font-semibold">
                    {pkg.discount}% OFF
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <PackageIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600">
                        {pkg.serviceCount} Services
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-green-600">
                          Rs.{pkg.finalPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          Rs.{pkg.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-green-700">
                        Package Savings
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        Rs.{(pkg.totalPrice - pkg.finalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Included Services:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.services
                        .slice(0, 2)
                        .map((service: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      {pkg.services.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{pkg.services.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPackage(pkg)}
                      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {}
          {packages.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No packages found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create your first package to get started.
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      {}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <PackageForm
              initialData={{
                name: editingPackage.name,
                description: editingPackage.description,
                services: editingPackage.serviceIds || [],
                discount: editingPackage.discount.toString(),
                isPrivate: editingPackage.isPrivate,
              }}
              onSubmit={handleUpdatePackage}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingPackage(null);
              }}
              isEditing={true}
              isSubmitting={updateLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, packageId: null })
        }
        onConfirm={confirmDeletePackage}
        title="Delete Package"
        description="Are you sure you want to delete this package? This action cannot be undone."
        type="danger"
        confirmText="Delete Package"
      />
    </div>
  );
}
