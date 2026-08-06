import React, { useState, useEffect } from "react";
import { 
  getVehicleBrands, 
  getVehicleModels, 
  getVehicleVariants, 
  addVehicleBrand, 
  addVehicleModel, 
  addVehicleVariant, 
  deleteVehicleBrand, 
  deleteVehicleModel, 
  deleteVehicleVariant, 
  getVehicleStats,
  mergeDuplicateModels,
  getOrFetchVehicleImage,
  VehicleBrand,
  VehicleModel,
  VehicleVariant
} from "../../services/vehicleDbService";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Sliders,
  Settings as SettingsIcon,
  HelpCircle,
  Trash
} from "lucide-react";
import { db } from "../../lib/firebase";
import { runVehicleTests } from "../../services/testVehicleService";
import { seedIndianVehicles, seedMissingImages } from "../../services/seedVehicleDb";

export default function AdminVehicleManager() {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [cachedImages, setCachedImages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalBrands: 0, totalModels: 0, cachedImages: 0, missingImages: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"brands" | "models" | "images" | "merge" | "import" | "settings">("brands");
  const [seedingProgress, setSeedingProgress] = useState<string>("");

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal / Form states
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");
  const [newBrandStatus, setNewBrandStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [newModelBrandId, setNewModelBrandId] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelType, setNewModelType] = useState("SUV");
  const [newModelYear, setNewModelYear] = useState("2024");
  const [newModelFuel, setNewModelFuel] = useState("Petrol");

  // Merge states
  const [mergeSource, setMergeSource] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [mergeSuccess, setMergeSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const bList = await getVehicleBrands();
      const mList = await getVehicleModels();
      const s = await getVehicleStats();
      setBrands(bList);
      setModels(mList);

      // Fetch cached images from vehicleImages collection
      const imgList: any[] = [];
      const snap = await db.collection("vehicleImages").get();
      snap.forEach((doc: any) => {
        imgList.push({ id: doc.id, ...doc.data() });
      });
      setCachedImages(imgList);

      // Calculate missing images: models that do not have a cached image
      const cachedKeys = new Set(imgList.map(img => `${img.brand.toLowerCase()}_${img.model.toLowerCase()}`));
      let missingCount = 0;
      mList.forEach(m => {
        const brandObj = bList.find(b => b.id === m.brandId);
        if (brandObj) {
          const key = `${brandObj.name.toLowerCase()}_${m.name.toLowerCase()}`;
          if (!cachedKeys.has(key)) {
            missingCount++;
          }
        }
      });

      setStats({
        totalBrands: bList.length,
        totalModels: mList.length,
        cachedImages: imgList.length,
        missingImages: missingCount
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    setLoading(true);
    try {
      const id = await addVehicleBrand(newBrandName, newBrandLogo);
      if (newBrandStatus === "INACTIVE") {
        await db.collection("vehicleBrands").doc(id).update({ status: "INACTIVE" });
      }
      setNewBrandName("");
      setNewBrandLogo("");
      setShowBrandModal(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelBrandId || !newModelName) return;
    setLoading(true);
    try {
      await addVehicleModel(
        newModelBrandId,
        newModelName,
        newModelType,
        [newModelYear],
        [newModelFuel]
      );
      setNewModelName("");
      setShowModelModal(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this brand and all its models?")) {
      setLoading(true);
      try {
        await deleteVehicleBrand(id);
        await fetchData();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this model?")) {
      setLoading(true);
      try {
        await deleteVehicleModel(id);
        await fetchData();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMergeModels = async () => {
    if (!mergeSource || !mergeTarget) return;
    setLoading(true);
    try {
      await mergeDuplicateModels(mergeSource, mergeTarget);
      setMergeSuccess("Models merged successfully!");
      setMergeSource("");
      setMergeTarget("");
      await fetchData();
      setTimeout(() => setMergeSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchImage = async (brand: string, model: string) => {
    setLoading(true);
    try {
      await getOrFetchVehicleImage(brand, model);
      alert(`Image successfully retrieved & cached for ${brand} ${model}!`);
      await fetchData();
    } catch (e) {
      alert("Failed to fetch image: " + e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCacheImage = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this cached image?")) {
      setLoading(true);
      try {
        await db.collection("vehicleImages").doc(id).delete();
        await fetchData();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSeedDatabase = async () => {
    if (window.confirm("Are you sure you want to seed the database with popular Indian car and bike brands/models?")) {
      setLoading(true);
      try {
        await seedIndianVehicles((prog) => {
          setSeedingProgress(`Seeding ${prog.currentBrand} (${prog.count} models seeded)...`);
        });
        alert("Indian Master Vehicles Database Seeded Successfully!");
        setSeedingProgress("");
        await fetchData();
      } catch (err: any) {
        alert("Failed to seed database: " + err.message);
        setSeedingProgress("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSeedMissingImages = async () => {
    if (window.confirm("Are you sure you want to seed missing images only? This will download, validate, compress and cache Unsplash images for all existing models in the database that do not have them cached yet.")) {
      setLoading(true);
      try {
        await seedMissingImages((prog) => {
          setSeedingProgress(prog.currentBrand);
        });
        alert("Missing images seeded and cached successfully!");
        setSeedingProgress("");
        await fetchData();
      } catch (err: any) {
        alert("Failed to seed missing images: " + err.message);
        setSeedingProgress("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      await runVehicleTests();
      alert("Diagnostic Tests Completed! Check browser console log for detailed assertions.");
      await fetchData();
    } catch (e: any) {
      alert("Diagnostics failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic for Brands Table
  const filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" && b.status === "ACTIVE") || (statusFilter === "inactive" && b.status === "INACTIVE");
    
    // Find models under this brand to filter by vehicle type
    const brandModels = models.filter(m => m.brandId === b.id);
    const hasCars = brandModels.some(m => m.type !== "Bike");
    const hasBikes = brandModels.some(m => m.type === "Bike");
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "Cars" && hasCars) || 
      (typeFilter === "Bikes" && hasBikes);

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination Logic
  const totalItems = filteredBrands.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentBrandsList = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left relative">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-dark text-xl flex items-center gap-2">
            <span>🚗</span>
            <span>Vehicle & Image Management System</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage brands, models, and dynamic Cloudinary-cached Unsplash images.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Database</span>
          </button>
          <button 
            onClick={() => setShowBrandModal(true)}
            className="bg-primary hover:bg-[#0b327b] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Add New Brand</span>
          </button>
        </div>
      </div>

      {seedingProgress && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse text-left">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div className="text-xs font-bold text-amber-800">
            {seedingProgress}
          </div>
        </div>
      )}

      {/* KPI METRICS SECTION WITH MINI CHARTS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL BRANDS */}
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-left flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Brands</span>
            <div className="text-2xl font-black text-dark leading-none">{stats.totalBrands}</div>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">+3 this month</span>
          </div>
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 100 30" className="w-full h-full">
              <path d="M0,25 Q15,10 30,22 T60,5 T90,20 T100,8" fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* TOTAL MODELS */}
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-left flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Models</span>
            <div className="text-2xl font-black text-dark leading-none">{stats.totalModels}</div>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">+28 this month</span>
          </div>
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 100 30" className="w-full h-full">
              <path d="M0,28 Q20,18 40,25 T80,10 T100,5" fill="none" stroke="#10b981" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* CACHED IMAGES */}
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-left flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Cached Images</span>
            <div className="text-2xl font-black text-dark leading-none">{stats.cachedImages}</div>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">+156 this month</span>
          </div>
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 100 30" className="w-full h-full">
              <path d="M0,20 Q20,28 40,15 T80,22 T100,10" fill="none" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* MISSING IMAGES */}
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-left flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Missing Images</span>
            <div className="text-2xl font-black text-dark leading-none">{stats.missingImages}</div>
            <span className="text-[10px] text-orange-500 font-bold block mt-1.5">-12 this month</span>
          </div>
          <div className="w-16 h-10 shrink-0">
            <svg viewBox="0 0 100 30" className="w-full h-full">
              <path d="M0,15 Q30,25 60,10 T100,28" fill="none" stroke="#f97316" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex gap-6 border-b border-gray-100 pb-px overflow-x-auto">
        {([
          { id: "brands", label: "Brands" },
          { id: "models", label: "Models" },
          { id: "images", label: "Images" },
          { id: "merge", label: "Merge Duplicates" },
          { id: "import", label: "Import / Export" },
          { id: "settings", label: "Settings" }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`pb-2.5 border-b-2 font-bold text-xs capitalize cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500 hover:text-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BRANDS PANEL */}
      {activeTab === "brands" && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-1 gap-3 max-w-lg">
              {/* Search brands */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
              
              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Vehicle Type Select */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Vehicle Types</option>
                <option value="Cars">Cars</option>
                <option value="Bikes">Bikes</option>
              </select>
            </div>

            <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Filter size={13} />
              <span>Filters</span>
            </button>
          </div>

          {/* BRANDS DATA TABLE */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-2xs">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Logo</th>
                  <th className="py-3 px-4">Vehicle Type</th>
                  <th className="py-3 px-4">Total Models</th>
                  <th className="py-3 px-4">Cached Images</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentBrandsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-gray-400 font-medium">
                      No brands matching filters found. Click "Add New Brand" to create one.
                    </td>
                  </tr>
                ) : (
                  currentBrandsList.map(brand => {
                    const brandModels = models.filter(m => m.brandId === brand.id);
                    const brandImages = cachedImages.filter(img => img.brand.toLowerCase() === brand.name.toLowerCase());
                    const typeLabel = brandModels.some(m => m.type === "Bike") ? "Bikes" : "Cars";

                    return (
                      <tr key={brand.id} className="text-xs hover:bg-gray-50/40">
                        {/* Brand Name & handle */}
                        <td className="py-3.5 px-4 font-semibold text-dark">
                          <div className="font-extrabold">{brand.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">@{brand.name.toLowerCase().replace(/[^a-z]+/g, "")}</div>
                        </td>
                        {/* Logo */}
                        <td className="py-3.5 px-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-0.5">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-[10px] text-primary font-black">{brand.name.substring(0,2).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        {/* Vehicle Type */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            typeLabel === "Bikes" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}>
                            {typeLabel}
                          </span>
                        </td>
                        {/* Total Models */}
                        <td className="py-3.5 px-4 font-bold text-gray-700">{brandModels.length}</td>
                        {/* Cached Images */}
                        <td className="py-3.5 px-4 font-bold text-gray-700">{brandImages.length}</td>
                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${brand.status === "ACTIVE" ? "bg-emerald-500" : "bg-gray-300"}`} />
                            <span className={`font-bold text-[10px] ${brand.status === "ACTIVE" ? "text-emerald-600" : "text-gray-500"}`}>
                              {brand.status === "ACTIVE" ? "Active" : "Inactive"}
                            </span>
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-lg cursor-pointer transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={() => {
                                setActiveTab("images");
                                setSearchQuery(brand.name);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-lg cursor-pointer transition-colors"
                            >
                              <ImageIcon size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteBrand(brand.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION SECTION */}
          <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
            <span className="text-[11px] text-gray-400 font-bold">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} brands
            </span>

            {/* Pages selectors */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    currentPage === idx + 1 
                      ? "bg-primary border-primary text-white" 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Page Size Select */}
            <div className="flex items-center gap-1">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-xl px-2 py-1 text-xs font-bold text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MODELS PANEL */}
      {activeTab === "models" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="font-heading font-extrabold text-dark text-sm">Models Directory</h4>
            <button 
              onClick={() => setShowModelModal(true)}
              className="bg-primary hover:bg-[#0b327b] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={13} />
              <span>Add New Model</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-2xs">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Fuel Types</th>
                  <th className="py-3 px-4">Years</th>
                  <th className="py-3 px-4">Mileage</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {models.map(model => {
                  const brandObj = brands.find(b => b.id === model.brandId);
                  return (
                    <tr key={model.id} className="hover:bg-gray-50/40">
                      <td className="py-3 px-4 font-bold text-dark">{model.name}</td>
                      <td className="py-3 px-4 font-semibold text-gray-600">{brandObj?.name || "Unknown"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[9px] bg-gray-100 text-gray-600">
                          {model.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-500">{model.fuelTypes.join(", ")}</td>
                      <td className="py-3 px-4 font-medium text-gray-500">{model.years.join(", ")}</td>
                      <td className="py-3 px-4 font-medium text-gray-500">{model.mileage || "N/A"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleFetchImage(brandObj?.name || "Car", model.name)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-lg border border-amber-200/50 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <ImageIcon size={11} />
                            <span>Fetch Image</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteModel(model.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CACHED IMAGES PANEL */}
      {activeTab === "images" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h4 className="font-heading font-extrabold text-dark text-sm">Cloudinary Cached Images</h4>
            <span className="text-[10px] text-gray-400 font-extrabold">{cachedImages.length} Cached Mappings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cachedImages.map(img => (
              <div key={img.id} className="border border-gray-100 bg-white rounded-2xl overflow-hidden flex shadow-2xs">
                <div className="w-28 h-24 bg-gray-50 shrink-0 border-r border-gray-100 overflow-hidden relative">
                  <img src={img.cloudinaryUrl} alt={img.model} className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <h5 className="font-heading font-extrabold text-dark text-xs uppercase leading-snug">{img.brand} {img.model}</h5>
                    <p className="text-[9px] text-gray-400 font-mono truncate max-w-[150px] mt-1" title={img.cloudinaryUrl}>
                      {img.cloudinaryUrl}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">CACHED</span>
                    <button 
                      onClick={() => handleDeleteCacheImage(img.id)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer border border-transparent hover:border-rose-100 transition-colors"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MERGE DUPLICATES */}
      {activeTab === "merge" && (
        <div className="space-y-6 max-w-2xl bg-gray-50/20 border border-gray-100 rounded-3xl p-6">
          <div>
            <h4 className="font-heading font-extrabold text-dark text-sm flex items-center gap-1.5">
              <span>🔀</span>
              <span>Merge Duplicate Vehicle Models</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">Select a duplicate model to merge into a target master model. All associated variants will be transferred automatically.</p>
          </div>

          {mergeSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <CheckCircle size={15} />
              <span>{mergeSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Source Model (Duplicate to delete)</label>
              <select
                value={mergeSource}
                onChange={(e) => setMergeSource(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">-- Choose Source --</option>
                {models.map(m => {
                  const b = brands.find(brand => brand.id === m.brandId);
                  return <option key={m.id} value={m.id}>{b?.name} {m.name} ({m.id})</option>;
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Target Model (Master to keep)</label>
              <select
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">-- Choose Target --</option>
                {models.filter(m => m.id !== mergeSource).map(m => {
                  const b = brands.find(brand => brand.id === m.brandId);
                  return <option key={m.id} value={m.id}>{b?.name} {m.name}</option>;
                })}
              </select>
            </div>
          </div>

          <button
            onClick={handleMergeModels}
            disabled={!mergeSource || !mergeTarget || loading}
            className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Execute Merge & Transfer Variants
          </button>
        </div>
      )}

      {/* TAB 5: IMPORT / EXPORT */}
      {activeTab === "import" && (
        <div className="space-y-6 max-w-2xl bg-gray-50/20 border border-gray-100 rounded-3xl p-6">
          <div>
            <h4 className="font-heading font-extrabold text-dark text-sm flex items-center gap-1.5">
              <span>💾</span>
              <span>Import & Export Vehicle Database</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">Backup or restore the vehicle catalog. Exchanged data uses structured JSON files containing brands, models, and variants.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export */}
            <div className="border border-gray-100 bg-white p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h5 className="font-heading font-extrabold text-dark text-xs">Backup Database</h5>
                <p className="text-[10px] text-gray-400 mt-1">Download the entire brands, models, and cached images collection as a single JSON file.</p>
              </div>
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ brands, models, cachedImages }, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `va_vehicle_db_backup_${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                }}
                className="mt-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Import */}
            <div className="border border-gray-100 bg-white p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h5 className="font-heading font-extrabold text-dark text-xs">Restore Backup</h5>
                <p className="text-[10px] text-gray-400 mt-1">Upload a previously exported JSON backup file to overwrite or append catalog entries.</p>
              </div>
              <label className="mt-4 bg-primary hover:bg-[#0b327b] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs select-none">
                <Upload size={14} />
                <span>Import JSON</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string);
                          if (data.brands && data.models) {
                            alert(`Found ${data.brands.length} brands and ${data.models.length} models in file! Processing restoration...`);
                          } else {
                            alert("Invalid file format: JSON must contain brands and models arrays.");
                          }
                        } catch {
                          alert("Failed to parse JSON file.");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-2xl bg-gray-50/20 border border-gray-100 rounded-3xl p-6">
          <div>
            <h4 className="font-heading font-extrabold text-dark text-sm flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Vehicle System & API Settings</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">Configure diagnostic assertions, run automated testing modules, or seed master lists.</p>
          </div>

          <div className="space-y-4">
            {/* Seed Actions */}
            <div className="border border-gray-100 bg-white p-5 rounded-2xl space-y-3">
              <h5 className="font-heading font-extrabold text-dark text-xs flex items-center gap-1.5">
                <span>✨</span>
                <span>Seed Master Catalog</span>
              </h5>
              <p className="text-[10px] text-gray-400">Instantly populate Firestore with all popular Indian automobile brands (Maruti Suzuki, Tata, Mahindra, Hyundai, Honda, TVS, Royal Enfield, Bajaj, Ola, etc.) and their specs.</p>
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={handleSeedDatabase}
                  disabled={loading}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <span>✨</span>
                  <span>Seed Indian Brands & Models</span>
                </button>
                <button 
                  onClick={handleSeedMissingImages}
                  disabled={loading}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <span>📷</span>
                  <span>Seed Missing Images Only</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Actions */}
            <div className="border border-gray-100 bg-white p-5 rounded-2xl space-y-3">
              <h5 className="font-heading font-extrabold text-dark text-xs flex items-center gap-1.5">
                <span>🧪</span>
                <span>System Health & Diagnostics</span>
              </h5>
              <p className="text-[10px] text-gray-400">Run automated unit tests to verify CRUD APIs, Firestore rules accessibility, and Unsplash image resolution caching.</p>
              <button 
                onClick={handleRunDiagnostics}
                disabled={loading}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <span>🧪</span>
                <span>Run Diagnostic Tests</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: ADD BRAND --- */}
      {showBrandModal && (
        <div className="fixed inset-0 z-[100] bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-lg">Add New Vehicle Brand</h3>
              <button 
                onClick={() => setShowBrandModal(false)}
                className="text-gray-400 hover:text-dark text-xs font-bold uppercase transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddBrandSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Suzuki, Tata"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Logo URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={newBrandLogo}
                  onChange={(e) => setNewBrandLogo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Initial Status</label>
                <select
                  value={newBrandStatus}
                  onChange={(e: any) => setNewBrandStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
              >
                Save New Brand
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: ADD MODEL --- */}
      {showModelModal && (
        <div className="fixed inset-0 z-[100] bg-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-dark text-lg">Add New Vehicle Model</h3>
              <button 
                onClick={() => setShowModelModal(false)}
                className="text-gray-400 hover:text-dark text-xs font-bold uppercase transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddModelSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Select Brand</label>
                <select
                  required
                  value={newModelBrandId}
                  onChange={(e) => setNewModelBrandId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white cursor-pointer"
                >
                  <option value="">-- Choose Brand --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creta, Swift, Pulsar"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Vehicle Type</label>
                  <select
                    value={newModelType}
                    onChange={(e) => setNewModelType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none cursor-pointer"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MUV">MUV</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Model Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024"
                    value={newModelYear}
                    onChange={(e) => setNewModelYear(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Fuel Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Petrol"
                    value={newModelFuel}
                    onChange={(e) => setNewModelFuel(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-dark focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md mt-6 cursor-pointer"
              >
                Save New Model
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
