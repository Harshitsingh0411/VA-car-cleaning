import { db } from "../lib/firebase";
import { logAuditAction } from "./dbService";
import { uploadMediaToCloudinary } from "./cloudinaryService";

export interface VehicleBrand {
  id: string;
  name: string;
  logoUrl?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  type: string; // e.g. SUV, Sedan, Hatchback, Bike
  years: string[]; // e.g. ["2023", "2024"]
  fuelTypes: string[]; // e.g. ["Petrol", "Diesel", "Electric"]
  mileage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleVariant {
  id: string;
  modelId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface VehicleImageCache {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  originalUrl: string;
  cloudinaryUrl: string;
  publicId?: string;
  status: "active" | "pending" | "broken";
  createdAt: string;
}

// Helper to fetch external image and convert to File for Cloudinary pipeline
const fetchImageAsFile = async (url: string, filename: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: HTTP status ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Fetched resource is not an image (Content-Type: ${contentType})`);
  }
  const blob = await response.blob();
  if (blob.size < 100) {
    throw new Error(`Fetched image blob is empty or corrupt (${blob.size} bytes)`);
  }
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
};

// 1. BRAND MANAGEMENT
export const getVehicleBrands = async (): Promise<VehicleBrand[]> => {
  const list: VehicleBrand[] = [];
  const snap = await db.collection("vehicleBrands").get();
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() } as VehicleBrand);
  });
  return list;
};

export const addVehicleBrand = async (name: string, logoUrl?: string): Promise<string> => {
  const id = "brand-" + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const data: VehicleBrand = {
    id,
    name,
    logoUrl,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now
  };
  await db.collection("vehicleBrands").doc(id).set(data);
  await logAuditAction(`Added vehicle brand: ${name}`);
  return id;
};

export const updateVehicleBrand = async (id: string, data: Partial<VehicleBrand>): Promise<void> => {
  await db.collection("vehicleBrands").doc(id).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteVehicleBrand = async (id: string): Promise<void> => {
  // Delete all models under this brand
  const models = await getVehicleModels(id);
  for (const model of models) {
    await deleteVehicleModel(model.id);
  }
  await db.collection("vehicleBrands").doc(id).delete();
  await logAuditAction(`Deleted vehicle brand: ${id}`);
};

// 2. MODEL MANAGEMENT
export const getVehicleModels = async (brandId?: string): Promise<VehicleModel[]> => {
  const list: VehicleModel[] = [];
  let query = db.collection("vehicleModels");
  if (brandId) {
    query = query.where("brandId", "==", brandId);
  }
  const snap = await query.get();
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() } as VehicleModel);
  });
  return list;
};

export const addVehicleModel = async (
  brandId: string,
  name: string,
  type: string,
  years: string[],
  fuelTypes: string[],
  mileage?: string
): Promise<string> => {
  const id = "model-" + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const data: VehicleModel = {
    id,
    brandId,
    name,
    type,
    years,
    fuelTypes,
    mileage: mileage || "12,000 km",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now
  };
  await db.collection("vehicleModels").doc(id).set(data);
  await logAuditAction(`Added vehicle model: ${name}`);
  return id;
};

export const updateVehicleModel = async (id: string, data: Partial<VehicleModel>): Promise<void> => {
  await db.collection("vehicleModels").doc(id).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteVehicleModel = async (id: string): Promise<void> => {
  await db.collection("vehicleModels").doc(id).delete();
  await logAuditAction(`Deleted vehicle model: ${id}`);
};

// 3. VARIANT MANAGEMENT
export const getVehicleVariants = async (modelId?: string): Promise<VehicleVariant[]> => {
  const list: VehicleVariant[] = [];
  let query = db.collection("vehicleVariants");
  if (modelId) {
    query = query.where("modelId", "==", modelId);
  }
  const snap = await query.get();
  snap.forEach((doc: any) => {
    list.push({ id: doc.id, ...doc.data() } as VehicleVariant);
  });
  return list;
};

export const addVehicleVariant = async (modelId: string, name: string): Promise<string> => {
  const id = "variant-" + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const data: VehicleVariant = {
    id,
    modelId,
    name,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now
  };
  await db.collection("vehicleVariants").doc(id).set(data);
  return id;
};

export const deleteVehicleVariant = async (id: string): Promise<void> => {
  await db.collection("vehicleVariants").doc(id).delete();
};

// 4. IMAGE SEARCH & AUTO-UPLOAD ENGINE
export const searchExternalImage = async (brand: string, model: string): Promise<string | null> => {
  try {
    const isBike = model.toLowerCase().includes("bike") || 
                   model.toLowerCase().includes("motorcycle") || 
                   model.toLowerCase().includes("bullet") || 
                   model.toLowerCase().includes("scooter") || 
                   model.toLowerCase().includes("r15") || 
                   model.toLowerCase().includes("pulsar") || 
                   model.toLowerCase().includes("royal enfield") ||
                   model.toLowerCase().includes("activa") ||
                   model.toLowerCase().includes("dio") ||
                   model.toLowerCase().includes("jupiter") ||
                   model.toLowerCase().includes("ntorq") ||
                   model.toLowerCase().includes("iqube") ||
                   model.toLowerCase().includes("chetak") ||
                   model.toLowerCase().includes("s1") ||
                   model.toLowerCase().includes("splendor") ||
                   model.toLowerCase().includes("deluxe") ||
                   model.toLowerCase().includes("glamour") ||
                   model.toLowerCase().includes("xpulse") ||
                   model.toLowerCase().includes("destini") ||
                   model.toLowerCase().includes("shine") ||
                   model.toLowerCase().includes("unicorn") ||
                   model.toLowerCase().includes("hness") ||
                   model.toLowerCase().includes("raider") ||
                   model.toLowerCase().includes("apache") ||
                   model.toLowerCase().includes("platina") ||
                   model.toLowerCase().includes("avenger");

    const isSUV = model.toLowerCase().includes("harrier") ||
                  model.toLowerCase().includes("safari") ||
                  model.toLowerCase().includes("thar") ||
                  model.toLowerCase().includes("scorpio") ||
                  model.toLowerCase().includes("xuv") ||
                  model.toLowerCase().includes("bolero") ||
                  model.toLowerCase().includes("creta") ||
                  model.toLowerCase().includes("alcazar") ||
                  model.toLowerCase().includes("tucson") ||
                  model.toLowerCase().includes("exter") ||
                  model.toLowerCase().includes("venue") ||
                  model.toLowerCase().includes("fortuner") ||
                  model.toLowerCase().includes("hyryder") ||
                  model.toLowerCase().includes("kushaq") ||
                  model.toLowerCase().includes("taigun") ||
                  model.toLowerCase().includes("sonet") ||
                  model.toLowerCase().includes("seltos") ||
                  model.toLowerCase().includes("carens") ||
                  model.toLowerCase().includes("elevate") ||
                  model.toLowerCase().includes("brezza") ||
                  model.toLowerCase().includes("grand vitara") ||
                  model.toLowerCase().includes("fronx") ||
                  model.toLowerCase().includes("jimny");

    // A list of 5 high-quality, verified Unsplash CDN URLs per category
    const suvImages = [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800"
    ];

    const carImages = [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800"
    ];

    const bikeImages = [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800"
    ];

    // Simple hash generator to ensure stable distribution of images
    let hash = 0;
    const combined = `${brand}_${model}`;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash);

    if (isBike) {
      return bikeImages[index % bikeImages.length];
    } else if (isSUV) {
      return suvImages[index % suvImages.length];
    } else {
      return carImages[index % carImages.length];
    }
  } catch (err) {
    console.error("External search error:", err);
  }
  return null;
};

export const getOrFetchVehicleImage = async (brand: string, model: string): Promise<string> => {
  // Sanitize the cacheKey to remove slashes and special characters that Firestore interprets as subcollections
  const cacheKey = `${brand.toLowerCase()}_${model.toLowerCase()}`
    .replace(/[\s/\\.+*[\]?^${}()|]/g, "_");
  
  // Safe, verified visible fallbacks
  const isBike = model.toLowerCase().includes("bike") || 
                 model.toLowerCase().includes("motorcycle") || 
                 model.toLowerCase().includes("bullet") || 
                 model.toLowerCase().includes("scooter") || 
                 model.toLowerCase().includes("r15") || 
                 model.toLowerCase().includes("pulsar") || 
                 model.toLowerCase().includes("royal enfield");
  const fallbackUrl = isBike
    ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"
    : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";

  // 1. Search Firestore cache collection
  try {
    const docRef = db.collection("vehicleImages").doc(cacheKey);
    const snap = await docRef.get();
    if (snap.exists()) {
      const cache = snap.data() as VehicleImageCache;
      if (cache.status === "active" && cache.cloudinaryUrl) {
        return cache.cloudinaryUrl;
      }
    }
  } catch (err) {
    console.warn("Error reading vehicle image cache:", err);
  }

  // 2. Cache Miss: Background image fetch from Unsplash
  let originalUrl = null;
  try {
    originalUrl = await searchExternalImage(brand, model);
  } catch (err) {
    console.warn("Unsplash image search failed:", err);
  }

  if (!originalUrl) {
    return fallbackUrl;
  }

  // 3. Upload to Cloudinary & Save to Cache
  try {
    const file = await fetchImageAsFile(originalUrl, `${cacheKey}.jpg`);
    const uploadResult = await uploadMediaToCloudinary(file);
    
    if (!uploadResult || !uploadResult.url) {
      throw new Error("Failed to upload image file to Cloudinary");
    }

    const cacheData: VehicleImageCache = {
      id: cacheKey,
      brand,
      model,
      originalUrl,
      cloudinaryUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    await db.collection("vehicleImages").doc(cacheKey).set(cacheData);
    return uploadResult.url;
  } catch (err) {
    console.error(`Failed to fetch and cache image for ${brand} ${model}:`, err);
    // Return verified visible fallback URL directly as a safe backup; do not save broken cache record
    return fallbackUrl;
  }
};

// 5. MERGE DUPLICATES & STATS
export const mergeDuplicateModels = async (sourceModelId: string, targetModelId: string): Promise<void> => {
  // Transfer all variants
  const variants = await getVehicleVariants(sourceModelId);
  for (const variant of variants) {
    await db.collection("vehicleVariants").doc(variant.id).update({
      modelId: targetModelId,
      updatedAt: new Date().toISOString()
    });
  }
  // Delete the source model
  await db.collection("vehicleModels").doc(sourceModelId).delete();
  await logAuditAction(`Merged duplicate model ${sourceModelId} into ${targetModelId}`);
};

export const getVehicleStats = async (): Promise<any> => {
  const brands = await getVehicleBrands();
  const models = await getVehicleModels();
  
  // Query images cache count
  let imageCount = 0;
  const imageSnap = await db.collection("vehicleImages").get();
  imageSnap.forEach(() => {
    imageCount++;
  });

  return {
    totalBrands: brands.length,
    totalModels: models.length,
    cachedImages: imageCount
  };
};
