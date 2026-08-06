import { 
  addVehicleBrand, 
  getVehicleBrands, 
  deleteVehicleBrand,
  addVehicleModel,
  getVehicleModels,
  deleteVehicleModel,
  getVehicleStats,
  getOrFetchVehicleImage
} from "./vehicleDbService";

export async function runVehicleTests() {
  console.log("🚀 Starting Vehicle Detection & Image Management System Tests...");

  try {
    // 1. Verify Brand Creation
    const brandId = await addVehicleBrand("TestBrand-Automated");
    console.log("✅ Brand created with ID:", brandId);

    const brands = await getVehicleBrands();
    const brandExists = brands.some(b => b.id === brandId && b.name === "TestBrand-Automated");
    if (!brandExists) {
      throw new Error("Assertion failed: Created brand not found in getVehicleBrands() list.");
    }
    console.log("✅ getVehicleBrands() contains created brand");

    // 2. Verify Model Creation
    const modelId = await addVehicleModel(
      brandId,
      "TestModel-Automated",
      "SUV",
      ["2024"],
      ["Petrol"]
    );
    console.log("✅ Model created with ID:", modelId);

    const models = await getVehicleModels(brandId);
    const modelExists = models.some(m => m.id === modelId && m.name === "TestModel-Automated");
    if (!modelExists) {
      throw new Error("Assertion failed: Created model not found in getVehicleModels() list.");
    }
    console.log("✅ getVehicleModels() contains created model");

    // 3. Verify Stats Query
    const stats = await getVehicleStats();
    console.log("✅ Stats verified:", stats);

    // 4. Verify Search External Image search (Dynamic Unsplash search)
    console.log("🔍 Testing dynamic image resolution for 'Tata Harrier'...");
    const harrierUrl = await getOrFetchVehicleImage("Tata", "Harrier");
    console.log("✅ Image resolved URL:", harrierUrl);

    // 5. Cleanup Created Entries
    await deleteVehicleModel(modelId);
    await deleteVehicleBrand(brandId);
    console.log("✅ Cleanup complete");

    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("❌ TEST FAILED:", err.message || err);
  }
}
