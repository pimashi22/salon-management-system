"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";

interface SearchFilters {
  searchTerm: string;
  category: string;
  status: string;
  priceRange: [number, number];
  duration: string;
  isPrivate: boolean | null;
  sortBy: string;
  sortOrder: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  type: "categories" | "services" | "packages";
}

export default function AdvancedSearch({
  onSearch,
  onReset,
  type,
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    status: "",
    priceRange: [0, 50000] as [number, number],
    duration: "",
    isPrivate: null as boolean | null,
    sortBy: "name",
    sortOrder: "asc",
  });

  const categories = [
    "Hair Services",
    "Nail Services",
    "Spa Services",
    "Beauty Services",
  ];
  const durations = ["30", "45", "60", "90", "120", "180"];
  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "price", label: "Price" },
    { value: "duration", label: "Duration" },
    { value: "created", label: "Date Created" },
  ];

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number | boolean | null | [number, number]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchTerm: "",
      category: "",
      status: "",
      priceRange: [0, 50000] as [number, number],
      duration: "",
      isPrivate: null,
      sortBy: "name",
      sortOrder: "asc",
    };
    setFilters(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) count++;
    if (filters.duration) count++;
    if (filters.isPrivate !== null) count++;
    return count;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-500" />
            Advanced Search & Filters
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {getActiveFiltersCount()} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={`Search ${type}...`}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => handleFilterChange("searchTerm", "")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {}
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {}
              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      handleFilterChange("sortBy", value)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) =>
                      handleFilterChange("sortOrder", value)
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">↑</SelectItem>
                      <SelectItem value="desc">↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {}
            {(type === "services" || type === "packages") && (
              <div className="space-y-4">
                {}
                <div>
                  <Label className="text-sm font-medium">
                    Price Range: ${filters.priceRange[0]} - $
                    {filters.priceRange[1]}
                  </Label>
                  <div className="px-2 py-4">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "priceRange",
                          value as [number, number]
                        )
                      }
                      max={50000}
                      min={0}
                      step={500}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {}
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <Select
                      value={filters.duration}
                      onValueChange={(value) =>
                        handleFilterChange("duration", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Duration</SelectItem>
                        {durations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {}
                  <div>
                    <Label className="text-sm font-medium">Service Type</Label>
                    <Select
                      value={
                        filters.isPrivate === null
                          ? "all"
                          : filters.isPrivate.toString()
                      }
                      onValueChange={(value) =>
                        handleFilterChange(
                          "isPrivate",
                          value === "all" ? null : value === "true"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="false">Public</SelectItem>
                        <SelectItem value="true">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="flex gap-2 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 bg-transparent"
              >
                <X className="w-4 h-4 mr-1" />
                Reset Filters
              </Button>
              <Button
                onClick={() => onSearch(filters)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Filter className="w-4 h-4 mr-1" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            {filters.searchTerm && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Search: &quot;{filters.searchTerm}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => handleFilterChange("searchTerm", "")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {filters.category && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Category: {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => handleFilterChange("category", "")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {filters.status && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700"
              >
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => handleFilterChange("status", "")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {(type === "services" || type === "packages") &&
              (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  Price: ${filters.priceRange[0]}-${filters.priceRange[1]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() =>
                      handleFilterChange("priceRange", [0, 50000] as [
                        number,
                        number
                      ])
                    }
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            {(type === "services" || type === "packages") &&
              filters.duration && (
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700"
                >
                  Duration: {filters.duration}m
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => handleFilterChange("duration", "")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
            {(type === "services" || type === "packages") &&
              filters.isPrivate !== null && (
                <Badge
                  variant="secondary"
                  className="bg-pink-100 text-pink-700"
                >
                  Type: {filters.isPrivate ? "Private" : "Public"}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => handleFilterChange("isPrivate", null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
