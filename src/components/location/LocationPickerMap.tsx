import React, { useState, useEffect } from "react";
import { MapPin, Navigation, ExternalLink, Check, AlertCircle, Loader2, Compass, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  addressText?: string;
  mapsUrl?: string;
}

// 1. Google Maps Iframe Embed Component
export function GoogleMapEmbed({
  latitude,
  longitude,
  zoom = 16,
  title = "Location Map",
  className = "h-48 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200"
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
  title?: string;
  className?: string;
}) {
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;

  return (
    <div className={`relative ${className}`}>
      <iframe
        title={title}
        src={embedUrl}
        className="w-full h-full border-0 rounded-2xl"
        loading="lazy"
        allowFullScreen
      />
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/95 backdrop-blur text-dark font-heading font-bold text-[10px] py-1 px-2.5 rounded-lg shadow-md hover:bg-white flex items-center gap-1.5 border border-gray-200 transition-all cursor-pointer"
      >
        <span>Open in Google Maps</span>
        <ExternalLink size={12} className="text-primary" />
      </a>
    </div>
  );
}

// 2. Custom Geolocation Hook
export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<LocationCoords | null>(null);

  const getCurrentLocation = (onSuccess?: (loc: LocationCoords) => void) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        let addressText = "";
        try {
          // Reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              addressText = data.display_name;
            }
          }
        } catch (e) {
          console.warn("Reverse geocode warning:", e);
        }

        const loc: LocationCoords = {
          latitude: lat,
          longitude: lng,
          addressText: addressText || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          mapsUrl
        };

        setCoords(loc);
        setLoading(false);
        if (onSuccess) onSuccess(loc);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied. Please allow location access in browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is currently unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get location timed out.");
            break;
          default:
            setError("An unknown location error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return { getCurrentLocation, loading, error, coords };
}

// 3. Customer Location Picker UI Component
export function CustomerLocationPicker({
  onLocationSelected,
  initialLat,
  initialLng,
  initialAddress
}: {
  onLocationSelected: (loc: LocationCoords) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}) {
  const { getCurrentLocation, loading, error, coords } = useGeolocation();
  const [selectedLoc, setSelectedLoc] = useState<LocationCoords | null>(
    initialLat && initialLng
      ? {
          latitude: initialLat,
          longitude: initialLng,
          addressText: initialAddress,
          mapsUrl: `https://www.google.com/maps?q=${initialLat},${initialLng}`
        }
      : null
  );

  const handleFetchLocation = () => {
    getCurrentLocation((loc) => {
      setSelectedLoc(loc);
      onLocationSelected(loc);
    });
  };

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-100 text-left">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-dark font-heading font-extrabold text-xs">
          <MapPin size={16} className="text-primary" />
          <span>Google Maps GPS Location</span>
        </div>

        <Button
          type="button"
          onClick={handleFetchLocation}
          disabled={loading}
          className="bg-primary hover:bg-[#0b327b] text-white text-[11px] py-1.5 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm border-none cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Compass size={13} />
              <span>{selectedLoc ? "Re-detect My GPS Location" : "Use Current GPS Location"}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[11px] flex items-center gap-2 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedLoc && (
        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-blue-100 text-xs">
            <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-dark block">GPS Location Pinned!</span>
              <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">
                {selectedLoc.addressText || `${selectedLoc.latitude.toFixed(5)}, ${selectedLoc.longitude.toFixed(5)}`}
              </p>
            </div>
          </div>

          {/* Embedded Map */}
          <GoogleMapEmbed
            latitude={selectedLoc.latitude}
            longitude={selectedLoc.longitude}
            title="Selected Customer Location"
            className="h-40 w-full rounded-xl overflow-hidden shadow-sm border border-blue-200"
          />
        </div>
      )}
    </div>
  );
}

// 4. Crew Location Broadcaster Component (Used on Employee Dashboard)
export function CrewLocationBroadcaster({
  bookingId,
  customerLat,
  customerLng,
  customerAddress,
  crewLat,
  crewLng,
  crewLocationUpdatedAt,
  onLocationUpdated
}: {
  bookingId: string;
  customerLat?: number;
  customerLng?: number;
  customerAddress?: string;
  crewLat?: number;
  crewLng?: number;
  crewLocationUpdatedAt?: string;
  onLocationUpdated?: (lat: number, lng: number) => void;
}) {
  const { getCurrentLocation, loading, error } = useGeolocation();
  const [broadcasting, setBroadcasting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleShareCrewLocation = () => {
    setBroadcasting(true);
    getCurrentLocation(async (loc) => {
      try {
        const { updateBookingCrewLocation } = await import("../../services/dbService");
        await updateBookingCrewLocation(bookingId, loc.latitude, loc.longitude);
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 4000);
        if (onLocationUpdated) onLocationUpdated(loc.latitude, loc.longitude);
      } catch (err) {
        console.error("Failed to update crew location in Firestore:", err);
      } finally {
        setBroadcasting(false);
      }
    });
  };

  const navUrl = customerLat && customerLng
    ? `https://www.google.com/maps/dir/?api=1&destination=${customerLat},${customerLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress || "")}`;

  return (
    <div className="p-4 bg-gradient-to-br from-slate-900 to-dark text-white rounded-2xl border border-white/10 space-y-4 text-left shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={18} className="text-[#F4B400] animate-pulse" />
          <span className="font-heading font-extrabold text-sm text-white">Crew Google Maps Live Dispatch</span>
        </div>
        {crewLat && crewLng && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck size={12} />
            Location Active
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {/* Share Live Location Button */}
        <button
          type="button"
          onClick={handleShareCrewLocation}
          disabled={loading || broadcasting}
          className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-extrabold text-xs py-2 px-4 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2 border-none"
        >
          {loading || broadcasting ? (
            <>
              <Loader2 size={14} className="animate-spin text-dark" />
              <span>Updating Live GPS...</span>
            </>
          ) : (
            <>
              <Compass size={14} />
              <span>Share / Update My Live GPS Location</span>
            </>
          )}
        </button>

        {/* Turn-by-Turn Navigation Button */}
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-2 border border-white/15 text-decoration-none"
        >
          <ExternalLink size={14} className="text-[#F4B400]" />
          <span>Navigate to Doorstep</span>
        </a>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-xl text-xs flex items-center gap-2 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 rounded-xl text-xs flex items-center gap-2 font-bold">
          <Check size={14} className="shrink-0" />
          <span>Live GPS location broadcasted to Customer & Admin!</span>
        </div>
      )}

      {/* Embedded Map Comparison if Customer or Crew coords present */}
      {(customerLat || crewLat) && (
        <div className="pt-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">
            📍 Doorstep Destination Preview
          </span>
          <GoogleMapEmbed
            latitude={customerLat || crewLat || 26.4499}
            longitude={customerLng || crewLng || 80.3319}
            title="Job Location Map"
            className="h-44 w-full rounded-xl overflow-hidden shadow-md border border-white/10"
          />
        </div>
      )}
    </div>
  );
}
