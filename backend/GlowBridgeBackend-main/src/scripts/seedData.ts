import { Pool } from "pg";
import { pool } from "../config/db";

// Salon data to ensure we have proper salons
const SAMPLE_SALONS = [
  {
    name: "Beauty Paradise Salon",
    type: "salon",
    bio: "Premium beauty services with expert stylists",
    location: "Colombo 03, Sri Lanka",
    contact_number: "+94771234567"
  },
  {
    name: "Glamour Hub",
    type: "beauty_parlor", 
    bio: "Complete beauty and wellness experience",
    location: "Kandy, Sri Lanka",
    contact_number: "+94771234568"
  },
  {
    name: "Elite Hair Studio",
    type: "salon",
    bio: "Modern hair cutting and styling",
    location: "Galle, Sri Lanka", 
    contact_number: "+94771234569"
  },
  {
    name: "Radiance Spa & Salon",
    type: "beauty_parlor",
    bio: "Luxury spa and beauty treatments",
    location: "Negombo, Sri Lanka",
    contact_number: "+94771234570"
  },
  {
    name: "The Gentleman's Cut",
    type: "barbershop",
    bio: "Classic barbershop experience for men",
    location: "Colombo 07, Sri Lanka",
    contact_number: "+94771234571"
  }
];

// Sample products that will be linked to salons
const SAMPLE_PRODUCTS = [
  {
    salon_index: 0, // Beauty Paradise Salon
    name: "Premium Hair Treatment",
    description: "Intensive hair repair and nourishment treatment",
    price: 2500,
    available_quantity: 20,
    is_public: true,
    discount: 10,
    image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400"
  },
  {
    salon_index: 0, // Beauty Paradise Salon  
    name: "Organic Face Mask",
    description: "Natural ingredients for glowing skin",
    price: 1800,
    available_quantity: 15,
    is_public: true,
    discount: 0,
    image_url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400"
  },
  {
    salon_index: 1, // Glamour Hub
    name: "Anti-Aging Serum",
    description: "Professional grade anti-aging treatment",
    price: 4500,
    available_quantity: 10,
    is_public: true,
    discount: 15,
    image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"
  },
  {
    salon_index: 1, // Glamour Hub
    name: "Luxury Hand Cream",
    description: "Moisturizing hand cream with natural extracts",
    price: 1200,
    available_quantity: 25,
    is_public: true,
    discount: 5,
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
  },
  {
    salon_index: 2, // Elite Hair Studio
    name: "Professional Shampoo",
    description: "Salon-grade shampoo for all hair types",
    price: 2200,
    available_quantity: 30,
    is_public: true,
    discount: 0,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
  },
  {
    salon_index: 2, // Elite Hair Studio
    name: "Hair Styling Gel",
    description: "Long-lasting hold styling gel",
    price: 1500,
    available_quantity: 18,
    is_public: true,
    discount: 20,
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400"
  },
  {
    salon_index: 3, // Radiance Spa & Salon
    name: "Aromatherapy Oil Set",
    description: "Essential oils for relaxation and wellness",
    price: 3500,
    available_quantity: 12,
    is_public: true,
    discount: 0,
    image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400"
  },
  {
    salon_index: 3, // Radiance Spa & Salon
    name: "Exfoliating Body Scrub",
    description: "Natural body scrub for smooth skin",
    price: 2800,
    available_quantity: 16,
    is_public: true,
    discount: 10,
    image_url: "https://images.unsplash.com/photo-1556228578-626d20c69600?w=400"
  },
  {
    salon_index: 4, // The Gentleman's Cut
    name: "Beard Oil",
    description: "Premium beard conditioning oil",
    price: 1800,
    available_quantity: 22,
    is_public: true,
    discount: 0,
    image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400"
  },
  {
    salon_index: 4, // The Gentleman's Cut
    name: "Hair Pomade",
    description: "Classic styling pomade for men",
    price: 2000,
    available_quantity: 20,
    is_public: true,
    discount: 8,
    image_url: "https://images.unsplash.com/photo-1465101046990-177043a3bbfa?w=400"
  }
];

async function clearProducts() {
  console.log("🗑️  Clearing existing products...");
  await pool.query('DELETE FROM "product"');
  console.log("✅ Products cleared successfully");
}

async function ensureSalons(): Promise<string[]> {
  console.log("🏪 Ensuring salons exist...");
  
  const salonIds: string[] = [];
  
  for (const salon of SAMPLE_SALONS) {
    // Check if salon already exists
    const existingResult = await pool.query(
      'SELECT id FROM salon WHERE name = $1',
      [salon.name]
    );
    
    if (existingResult.rows.length > 0) {
      console.log(`  ✅ Salon "${salon.name}" already exists`);
      salonIds.push(existingResult.rows[0].id);
    } else {
      // Create new salon
      const createResult = await pool.query(
        `INSERT INTO salon (name, type, bio, location, contact_number)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [salon.name, salon.type, salon.bio, salon.location, salon.contact_number]
      );
      
      console.log(`  ✅ Created salon "${salon.name}"`);
      salonIds.push(createResult.rows[0].id);
    }
  }
  
  return salonIds;
}

async function seedProducts(salonIds: string[]) {
  console.log("🛍️  Seeding products with proper salon relationships...");
  
  for (const product of SAMPLE_PRODUCTS) {
    const salonId = salonIds[product.salon_index];
    
    await pool.query(
      `INSERT INTO "product" (salon_id, name, description, price, available_quantity, is_public, discount, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        salonId,
        product.name,
        product.description,
        product.price,
        product.available_quantity,
        product.is_public,
        product.discount,
        product.image_url
      ]
    );
    
    console.log(`  ✅ Created product "${product.name}" for salon index ${product.salon_index}`);
  }
}

async function verifySeedData() {
  console.log("🔍 Verifying seeded data...");
  
  // Check salon count
  const salonResult = await pool.query('SELECT COUNT(*) as count FROM salon');
  console.log(`  📊 Total salons: ${salonResult.rows[0].count}`);
  
  // Check product count
  const productResult = await pool.query('SELECT COUNT(*) as count FROM "product"');
  console.log(`  📊 Total products: ${productResult.rows[0].count}`);
  
  // Check products with salon names (test our JOIN)
  const joinResult = await pool.query(`
    SELECT p.name as product_name, s.name as salon_name
    FROM "product" p
    LEFT JOIN salon s ON p.salon_id = s.id
    LIMIT 5
  `);
  
  console.log("  🔗 Sample product-salon relationships:");
  joinResult.rows.forEach(row => {
    console.log(`    "${row.product_name}" → "${row.salon_name}"`);
  });
}

export async function seedDatabase() {
  try {
    console.log("🚀 Starting database seeding process...");
    
    // Step 1: Clear existing products
    await clearProducts();
    
    // Step 2: Ensure salons exist
    const salonIds = await ensureSalons();
    
    // Step 3: Seed products with proper salon relationships
    await seedProducts(salonIds);
    
    // Step 4: Verify the data
    await verifySeedData();
    
    console.log("🎉 Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}