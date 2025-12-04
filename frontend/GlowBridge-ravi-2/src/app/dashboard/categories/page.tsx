"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  Eye,
  FolderOpen,
  Package,
  Loader2,
  Search,
  X,
} from "lucide-react";
import CategoryForm from "@/components/category-form";
import ConfirmationModal from "@/components/confirmation-modal";
import { Pagination } from "@/shared/components/pagination";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/lib/categoryApi";
import { showApiErrorToast } from "@/lib/errorToast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId: string | null;
  }>({ isOpen: false, categoryId: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const limit = 10;

  const loadCategories = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);

      const result = await fetchCategories(page, limit, search);

      setCategories(result.categories);
      setFilteredCategories(result.categories);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      showApiErrorToast(error, "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1);
  }, []);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    loadCategories(1, searchTerm || undefined);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    loadCategories(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCategories(page, searchTerm || undefined);
  };

  const handleAddCategory = async (formData: {
    name: string;
    description: string;
  }) => {
    try {
      setActionLoading(true);
      await createCategory({
        name: formData.name,
        description: formData.description,
        is_active: true,
      });

      setIsAddDialogOpen(false);

      await loadCategories(currentPage, searchTerm || undefined);
    } catch (error) {
      showApiErrorToast(error, "Failed to create category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async (formData: {
    name: string;
    description: string;
  }) => {
    if (!editingCategory) return;

    try {
      setActionLoading(true);
      await updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
        is_active: editingCategory.is_active,
      });

      setIsEditDialogOpen(false);
      setEditingCategory(null);

      await loadCategories(currentPage, searchTerm || undefined);
    } catch (error) {
      showApiErrorToast(error, "Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setDeleteConfirmation({ isOpen: true, categoryId: id });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmation.categoryId) return;

    try {
      setActionLoading(true);
      await deleteCategory(deleteConfirmation.categoryId);

      setDeleteConfirmation({ isOpen: false, categoryId: null });

      await loadCategories(currentPage, searchTerm || undefined);
    } catch (error) {
      showApiErrorToast(error, "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewServices = (category: Category) => {
    router.push(`/dashboard/categories/${category.id}/services`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">
          Loading categories...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your service categories and organize your offerings
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleAddCategory}
              onCancel={() => setIsAddDialogOpen(false)}
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
                placeholder="Search categories by name or description..."
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Categories
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {categories.length}
                </p>
                <p className="text-xs text-blue-600">
                  Showing {filteredCategories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Displaying</p>
                <p className="text-2xl font-bold text-green-800">
                  {filteredCategories.length}
                </p>
                <p className="text-xs text-green-600">Results shown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/50"
          >
            <div className="relative p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <Badge
                  className={
                    category.is_active
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }
                >
                  {category.is_active ? "active" : "inactive"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      Category
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewServices(category)}
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Services
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                    className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      {filteredCategories.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No categories found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search filters or create a new category.
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
        itemLabel="categories"
      />

      {}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              initialData={{
                name: editingCategory.name,
                description: editingCategory.description,
              }}
              onSubmit={handleUpdateCategory}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
              }}
              isEditing={true}
              isLoading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, categoryId: null })
        }
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone and will affect all associated services."
        type="danger"
        confirmText="Delete Category"
      />
    </div>
  );
}
