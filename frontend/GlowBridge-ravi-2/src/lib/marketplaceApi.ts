import { fetchProducts, Product as ProductApiBackendProduct } from "./productApi";

interface BackendProduct extends ProductApiBackendProduct {
  salon_name?: string;
  salon_type?: string;
  salon_location?: string;
}

export interface MarketplaceProduct {
  id: number;
  originalId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  inStock: boolean;
  salon: string;
}
const transformToMarketplaceProduct = (
  backendProduct: BackendProduct
): MarketplaceProduct => {
  return {
    id: parseInt(backendProduct.id) || Math.floor(Math.random() * 10000),
    originalId: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description || "Premium beauty product",
    price: backendProduct.price,
    category: getCategoryDisplayName(backendProduct.category),
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 200) + 50,
    image: backendProduct.imageUrl || "/api/placeholder/300/300",
    inStock: backendProduct.status !== "out-of-stock",
    salon: backendProduct.salon_name || `Salon ${backendProduct.salonId.slice(0, 8)}`,
  };
};
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "hair-care": "Hair Care",
    "skin-care": "Skincare",
    tools: "Tools",
    accessories: "Accessories",
  };
  return categoryMap[category] || "Beauty";
};
export interface MarketplacePaginatedResult {
  products: MarketplaceProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export const fetchMarketplaceProducts = async (
  page: number = 1,
  limit: number = 10,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  search?: string
): Promise<MarketplacePaginatedResult> => {
  try {
    // Fetch from the new public products endpoint that includes salon information
    const response = await fetch('/api_g/products/public');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch products');
    }

    let products: MarketplaceProduct[] = result.data.map(transformToMarketplaceProduct);

    // Apply client-side filtering
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product: MarketplaceProduct) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== "All") {
      products = products.filter((product: MarketplaceProduct) => product.category === category);
    }

    // Apply price filtering
    if (minPrice !== undefined) {
      products = products.filter((product: MarketplaceProduct) => product.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      products = products.filter((product: MarketplaceProduct) => product.price <= maxPrice);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const totalPages = Math.ceil(products.length / limit);

    return {
      products: paginatedProducts,
      total: products.length,
      page,
      limit,
      totalPages,
    };
  } catch {
    return {
      products: [],
      total: 0,
      page: 1,
      limit: limit,
      totalPages: 0,
    };
  }
};
