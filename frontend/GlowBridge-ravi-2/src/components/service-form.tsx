"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calculator, Loader2 } from "lucide-react";

interface ServiceData {
  name: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  discount: string;
  isPrivate: boolean;
  finalPrice?: number;
}

interface ServiceFormProps {
  initialData?: {
    name: string;
    description: string;
    category: string;
    duration: string;
    price: string;
    discount: string;
    isPrivate: boolean;
  };
  onSubmit: (data: ServiceData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  prefilledCategory?: string;
  isLoading?: boolean;
}

const categories = [
  "Hair Services",
  "Nail Services",
  "Spa Services",
  "Beauty Services",
];
const durations = ["30", "45", "60", "90", "120", "180"];

export default function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  prefilledCategory,
  isLoading = false,
}: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || prefilledCategory || "",
    duration: initialData?.duration || "",
    price: initialData?.price || "",
    discount: initialData?.discount || "",
    isPrivate: initialData?.isPrivate || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const price = Number.parseFloat(formData.price) || 0;
    const discount = Number.parseFloat(formData.discount) || 0;
    const calculated = price - (price * discount) / 100;
    setFinalPrice(calculated);
  }, [formData.price, formData.discount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (
      formData.discount &&
      (Number.parseFloat(formData.discount) < 0 ||
        Number.parseFloat(formData.discount) > 100)
    ) {
      newErrors.discount = "Discount must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        finalPrice,
      });
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="service-name" className="text-sm font-medium">
            Service Name *
          </Label>
          <Input
            id="service-name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              clearError("name");
            }}
            placeholder="Enter service name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="service-description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="service-description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              clearError("description");
            }}
            placeholder="Enter service description"
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label htmlFor="service-category" className="text-sm font-medium">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => {
              setFormData({ ...formData, category: value });
              clearError("category");
            }}
            disabled={!!prefilledCategory}
          >
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category}</p>
          )}
          {prefilledCategory && (
            <p className="text-xs text-blue-600 mt-1">
              Category is automatically set for this service
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="service-duration" className="text-sm font-medium">
            Duration *
          </Label>
          <Select
            value={formData.duration}
            onValueChange={(value) => {
              setFormData({ ...formData, duration: value });
              clearError("duration");
            }}
          >
            <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durations.map((duration) => (
                <SelectItem key={duration} value={duration}>
                  {duration} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
          )}
        </div>

        <div>
          <Label htmlFor="service-price" className="text-sm font-medium">
            Price (Rs.) *
          </Label>
          <Input
            id="service-price"
            type="number"
            value={formData.price}
            onChange={(e) => {
              setFormData({ ...formData, price: e.target.value });
              clearError("price");
            }}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <Label htmlFor="service-discount" className="text-sm font-medium">
            Discount (%)
          </Label>
          <Input
            id="service-discount"
            type="number"
            value={formData.discount}
            onChange={(e) => {
              setFormData({ ...formData, discount: e.target.value });
              clearError("discount");
            }}
            placeholder="0"
            min="0"
            max="100"
            className={errors.discount ? "border-red-500" : ""}
          />
          {errors.discount && (
            <p className="text-sm text-red-500 mt-1">{errors.discount}</p>
          )}
        </div>
      </div>

      {}
      {formData.price && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Price Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Original Price:</span>
              <span className="font-medium text-green-800">
                Rs. {Number.parseFloat(formData.price).toFixed(2)}
              </span>
            </div>
            {formData.discount && Number.parseFloat(formData.discount) > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">
                    Discount ({formData.discount}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -Rs.
                    {(
                      (Number.parseFloat(formData.price) *
                        Number.parseFloat(formData.discount)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                <hr className="border-green-200" />
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">
                Final Price:
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
          id="service-private"
          checked={formData.isPrivate}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPrivate: checked })
          }
        />
        <div className="flex-1">
          <Label
            htmlFor="service-private"
            className="text-sm font-medium text-purple-700"
          >
            Private Service
          </Label>
          <p className="text-xs text-purple-600 mt-1">
            Private services are only visible to selected customers
          </p>
        </div>
      </div>

      {}
      {formData.name && formData.category && (
        <div>
          <Label className="text-sm font-medium">Live Preview</Label>
          <Card className="mt-2 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {formData.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {formData.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {formData.isPrivate && (
                    <Badge className="bg-purple-500 text-white text-xs">
                      Private
                    </Badge>
                  )}
                  <Badge className="bg-green-500 text-white text-xs">
                    active
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {formData.description || "No description provided"}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {formData.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      {formData.duration}m
                    </span>
                  </div>
                )}
                {formData.price && (
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-green-600">
                        Rs.{finalPrice.toFixed(2)}
                      </span>
                      {formData.discount &&
                        Number.parseFloat(formData.discount) > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${Number.parseFloat(formData.price).toFixed(2)}
                          </span>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {formData.discount &&
                Number.parseFloat(formData.discount) > 0 && (
                  <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-red-700">
                        Discount Applied
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {formData.discount}% OFF
                      </span>
                    </div>
                  </div>
                )}
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
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Service"
          ) : (
            "Create Service"
          )}
        </Button>
      </div>
    </form>
  );
}
