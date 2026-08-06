import { 
  addVehicleBrand, 
  addVehicleModel, 
  getOrFetchVehicleImage,
  getVehicleBrands,
  getVehicleModels
} from "./vehicleDbService";
import { db } from "../lib/firebase";

export interface SeedProgress {
  status: "idle" | "seeding" | "success" | "error";
  currentBrand: string;
  count: number;
}

export async function seedIndianVehicles(onProgress?: (progress: SeedProgress) => void) {
  const data = [
    // --- CAR BRANDS & MODELS ---
    {
      brand: "Maruti Suzuki",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Suzuki_logo_2.svg/1200px-Suzuki_logo_2.svg.png",
      models: [
        { name: "Alto K10", type: "Hatchback", years: ["2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Wagon R", type: "Hatchback", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Swift", type: "Hatchback", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Dzire", type: "Sedan", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Baleno", type: "Hatchback", years: ["2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Brezza", type: "SUV", years: ["2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Ertiga", type: "Van", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Grand Vitara", type: "SUV", years: ["2022", "2023", "2024"], fuels: ["Petrol", "Hybrid"] },
        { name: "Fronx", type: "SUV", years: ["2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Jimny", type: "SUV", years: ["2023", "2024"], fuels: ["Petrol"] }
      ]
    },
    {
      brand: "Hyundai",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png",
      models: [
        { name: "Grand i10 Nios", type: "Hatchback", years: ["2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "i20", type: "Hatchback", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Exter", type: "SUV", years: ["2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Venue", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Creta", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Verna", type: "Sedan", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Alcazar", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Tucson", type: "SUV", years: ["2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] }
      ]
    },
    {
      brand: "Tata Motors",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tata_logo.svg/1200px-Tata_logo.svg.png",
      models: [
        { name: "Tiago", type: "Hatchback", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG", "Electric"] },
        { name: "Tigor", type: "Sedan", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG", "Electric"] },
        { name: "Altroz", type: "Hatchback", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel", "CNG"] },
        { name: "Punch", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "CNG", "Electric"] },
        { name: "Nexon", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel", "Electric"] },
        { name: "Harrier", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Diesel"] },
        { name: "Safari", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Diesel"] }
      ]
    },
    {
      brand: "Mahindra",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mahindra_Rise_logo.svg/1200px-Mahindra_Rise_logo.svg.png",
      models: [
        { name: "Thar", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Scorpio Classic", type: "SUV", years: ["2022", "2023", "2024"], fuels: ["Diesel"] },
        { name: "Scorpio-N", type: "SUV", years: ["2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "XUV700", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "XUV300 / XUV 3XO", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Bolero", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Diesel"] }
      ]
    },
    {
      brand: "Honda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png",
      models: [
        { name: "Amaze", type: "Sedan", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "City", type: "Sedan", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Petrol", "Hybrid"] },
        { name: "Elevate", type: "SUV", years: ["2023", "2024"], fuels: ["Petrol"] }
      ]
    },
    {
      brand: "Toyota",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png",
      models: [
        { name: "Glanza", type: "Hatchback", years: ["2022", "2023", "2024"], fuels: ["Petrol", "CNG"] },
        { name: "Urban Cruiser Hyryder", type: "SUV", years: ["2022", "2023", "2024"], fuels: ["Petrol", "CNG", "Hybrid"] },
        { name: "Innova Crysta", type: "Van", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Diesel"] },
        { name: "Innova Hycross", type: "Van", years: ["2023", "2024"], fuels: ["Petrol", "Hybrid"] },
        { name: "Fortuner", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] }
      ]
    },
    {
      brand: "Kia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_logo.svg/1200px-Kia_logo.svg.png",
      models: [
        { name: "Sonet", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Seltos", type: "SUV", years: ["2020", "2021", "2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] },
        { name: "Carens", type: "Van", years: ["2022", "2023", "2024"], fuels: ["Petrol", "Diesel"] }
      ]
    },
    {
      brand: "Skoda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/%C5%A0koda_Auto_logo_%282022%29.svg/1200px-%C5%A0koda_Auto_logo_%282022%29.svg.png",
      models: [
        { name: "Slavia", type: "Sedan", years: ["2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Kushaq", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] }
      ]
    },
    {
      brand: "Volkswagen",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1200px-Volkswagen_logo_2019.svg.png",
      models: [
        { name: "Virtus", type: "Sedan", years: ["2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Taigun", type: "SUV", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] }
      ]
    },

    // --- BIKE BRANDS & MODELS ---
    {
      brand: "Hero MotoCorp",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hero_MotoCorp_logo.svg/1200px-Hero_MotoCorp_logo.svg.png",
      models: [
        { name: "Splendor Plus", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "HF Deluxe", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Glamour", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "XPulse 200", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Destini 125", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] }
      ]
    },
    {
      brand: "Honda Two Wheelers",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Honda_Logo.svg/1200px-Honda_Logo.svg.png",
      models: [
        { name: "Activa 6G", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Dio", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Shine 125", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Unicorn", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Hness CB350", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] }
      ]
    },
    {
      brand: "TVS Motor",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/TVS_Motor_Company_logo.svg/1200px-TVS_Motor_Company_logo.svg.png",
      models: [
        { name: "Jupiter", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Ntorq 125", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Apache RTR 160", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Raider 125", type: "Bike", years: ["2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "iQube", type: "Bike", years: ["2022", "2023", "2024"], fuels: ["Electric"] }
      ]
    },
    {
      brand: "Bajaj Auto",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Bajaj_logo.svg/1200px-Bajaj_logo.svg.png",
      models: [
        { name: "Pulsar 150", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Pulsar NS200", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Platina 100", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Avenger Cruise 220", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Chetak", type: "Bike", years: ["2022", "2023", "2024"], fuels: ["Electric"] }
      ]
    },
    {
      brand: "Royal Enfield",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Royal_Enfield_logo.svg/1200px-Royal_Enfield_logo.svg.png",
      models: [
        { name: "Classic 350", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Bullet 350", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Meteor 350", type: "Bike", years: ["2021", "2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Hunter 350", type: "Bike", years: ["2022", "2023", "2024"], fuels: ["Petrol"] },
        { name: "Himalayan 450", type: "Bike", years: ["2023", "2024"], fuels: ["Petrol"] }
      ]
    },
    {
      brand: "Ola Electric",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ola_Electric_logo.svg/1200px-Ola_Electric_logo.svg.png",
      models: [
        { name: "S1 Pro", type: "Bike", years: ["2022", "2023", "2024"], fuels: ["Electric"] },
        { name: "S1 Air", type: "Bike", years: ["2023", "2024"], fuels: ["Electric"] },
        { name: "S1 X", type: "Bike", years: ["2023", "2024"], fuels: ["Electric"] }
      ]
    }
  ];

  console.log("Starting seeding of Indian Master Vehicles...");
  let count = 0;
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const item of data) {
    if (onProgress) {
      onProgress({ status: "seeding", currentBrand: `Seeding Brand: ${item.brand}...`, count });
    }

    try {
      const brandId = await addVehicleBrand(item.brand, item.logo);
      console.log(`Seeded Brand: ${item.brand} -> ${brandId}`);
      await sleep(200);

      for (const m of item.models) {
        if (onProgress) {
          onProgress({ 
            status: "seeding", 
            currentBrand: `Brand: ${item.brand} — Adding Model: ${m.name}...`, 
            count 
          });
        }
        await addVehicleModel(brandId, m.name, m.type, m.years, m.fuels);
        await sleep(150);

        // Pre-fetch model image (triggers Unsplash search, client-side compression, and Cloudinary upload)
        if (onProgress) {
          onProgress({ 
            status: "seeding", 
            currentBrand: `Brand: ${item.brand} — Caching & Compressing ${m.name} image...`, 
            count 
          });
        }
        try {
          await getOrFetchVehicleImage(item.brand, m.name);
          await sleep(200);
        } catch (imgErr) {
          console.warn(`Could not cache image for ${item.brand} ${m.name}:`, imgErr);
        }

        count++;
      }
    } catch (error) {
      console.error(`Failed seeding brand ${item.brand}:`, error);
    }
  }

  console.log("Successfully seeded Indian Master Vehicles database.");
  if (onProgress) {
    onProgress({ status: "success", currentBrand: "Completed", count });
  }
}

export async function seedMissingImages(onProgress?: (progress: SeedProgress) => void) {
  const brands = await getVehicleBrands();
  const models = await getVehicleModels();
  
  // 1. Fetch current cached image keys
  const cachedKeys = new Set<string>();
  try {
    const snap = await db.collection("vehicleImages").get();
    snap.forEach((doc: any) => {
      cachedKeys.add(doc.id); // doc.id is already sanitized and lowercase
    });
  } catch (err) {
    console.error("Failed to read vehicleImages cache:", err);
  }

  console.log("Starting missing images seeding...");
  let count = 0;
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Find models that don't have cached images
  const missingModels = models.filter(m => {
    const brandObj = brands.find(b => b.id === m.brandId);
    if (!brandObj) return false;
    const cacheKey = `${brandObj.name.toLowerCase()}_${m.name.toLowerCase()}`
      .replace(/[\s/\\.+*[\]?^${}()|]/g, "_");
    return !cachedKeys.has(cacheKey);
  });

  const total = missingModels.length;
  console.log(`Found ${total} models missing images.`);

  for (const m of missingModels) {
    const brandObj = brands.find(b => b.id === m.brandId);
    if (!brandObj) continue;

    if (onProgress) {
      onProgress({ 
        status: "seeding", 
        currentBrand: `Brand: ${brandObj.name} — Caching missing image for ${m.name} (${count + 1}/${total})...`, 
        count 
      });
    }

    try {
      await getOrFetchVehicleImage(brandObj.name, m.name);
      await sleep(300); // Throttling delay
      count++;
    } catch (err) {
      console.warn(`Failed to seed image for ${brandObj.name} ${m.name}:`, err);
    }
  }

  console.log("Successfully seeded missing images.");
  if (onProgress) {
    onProgress({ status: "success", currentBrand: "Completed", count });
  }
}
