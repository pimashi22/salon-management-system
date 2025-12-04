"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Scissors,
  Loader2,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useShoppingCart } from "./ShoppingProvider";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  fetchMarketplaceProducts,
  MarketplaceProduct,
} from "@/lib/marketplaceApi";
import AuthModal from "./AuthModal";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(12);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const { addToCart, cartCount, setIsCartOpen } = useShoppingCart();
  const { userData, logout } = useAuth();

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      setError(null);

      const result = await fetchMarketplaceProducts(
        currentPage,
        productsPerPage,
        undefined, // No category filtering
        priceRange[0],
        priceRange[1],
        searchQuery
      );

      setProducts(result.products);
      setTotalProducts(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setProductsLoading(false);
    }
  }, [currentPage, productsPerPage, priceRange, searchQuery, inStockOnly]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by stock status if "In Stock Only" is checked
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [products, sortBy, inStockOnly]);

  const handleAddToCart = (product: MarketplaceProduct) => {
    addToCart({
      id: product.id,
      originalId: product.originalId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {}
      <div className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {}
              <div className="flex items-center space-x-2">
                <Scissors className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-heading text-foreground">
                  Glow<span className="text-primary">Bridge</span>
                </span>
              </div>
              {}
              <Link
                href="/"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Main Site</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {}
              {userData ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-sm font-medium">{userData.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {userData.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block ml-1">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => openAuthModal("login")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={() => openAuthModal("signup")} size="sm">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Beauty & Wellness Marketplace
            </h1>
            <p className="text-base text-muted-foreground mb-4 max-w-xl mx-auto">
              Discover premium beauty products from top-rated salons
            </p>

            {/* Quick stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {totalProducts} Products Available
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Free Shipping
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Trusted Salons
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Products
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalProducts} products • Premium quality guaranteed
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={productsPerPage}
                  onChange={(e) => {
                    setProductsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>All products</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {}
          <div
            className={`md:block ${
              showFilters ? "block" : "hidden"
            } w-full md:w-64 space-y-6`}
          >
            <Card className="shadow-lg border-0 bg-gradient-to-b from-background to-background/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-3">
                    Price Range
                  </h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      min={0}
                      step={500}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>LKR {priceRange[0].toLocaleString()}</span>
                      <span>LKR {priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      In Stock Only
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                {productsLoading
                  ? "Loading products..."
                  : error
                  ? "Error loading products"
                  : `Showing ${filteredProducts.length} of ${totalProducts} products`}
              </p>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Loading products...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadProducts} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-b from-background to-muted/20 rounded-lg border-2 border-dashed border-muted">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Search className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms to find what
                    you&apos;re looking for.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setPriceRange([0, 10000]);
                        setInStockOnly(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={loadProducts}>Refresh Products</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-md bg-gradient-to-b from-background to-background/50 h-full flex flex-col"
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {}
                      <div className="relative overflow-hidden rounded-t-lg">
                        <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center relative">
                          {product.image && product.image !== "/api/placeholder/300/300" ? (
                            <>
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                              {/* Fallback UI (hidden by default) */}
                              <div className="absolute inset-0 items-center justify-center hidden">
                                <div className="absolute inset-0 opacity-20">
                                  <div className="w-full h-full bg-gradient-to-br from-transparent via-primary/10 to-transparent"></div>
                                </div>
                                <div className="relative z-10 text-center">
                                  <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Scissors className="h-8 w-8 text-primary" />
                                  </div>
                                  <span className="text-muted-foreground text-sm font-medium">
                                    {product.name}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Decorative pattern */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="w-full h-full bg-gradient-to-br from-transparent via-primary/10 to-transparent"></div>
                              </div>
                              <div className="relative z-10 text-center">
                                <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Scissors className="h-8 w-8 text-primary" />
                                </div>
                                <span className="text-muted-foreground text-sm font-medium">
                                  {product.name}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/90 hover:bg-background shadow-sm"
                          onClick={() => toggleWishlist(product.id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              wishlist.includes(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-background/70 flex items-center justify-center backdrop-blur-sm">
                            <Badge variant="secondary" className="shadow-sm">
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                        {/* New badge for popular items */}
                        {product.rating > 4.7 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm">
                              ⭐ Popular
                            </Badge>
                          </div>
                        )}
                      </div>

                      {}
                      <div className="p-5 flex flex-col h-full">
                        <div className="flex-grow space-y-4">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                              <p className="text-xs text-muted-foreground">
                                by {product.salon}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price and Action section - Fixed at bottom */}
                        <div className="space-y-3 pt-4 border-t border-border mt-4">
                          <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                              LKR{" "}
                              {product.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            size="sm"
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Products Count Display */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Showing {products.length} of {totalProducts} products
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>
          </div>
        </div>
      </div>

      {}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {}}
      />
    </div>
  );
}
