export interface PriceConfig {
  price: number;
  label: string;
  formatted: string;
}

const defaultPrices: Record<string, PriceConfig> = {
  exteriorWash: {
    price: 299,
    label: "299",
    formatted: "₹299"
  },
  interiorCleaning: {
    price: 599,
    label: "599",
    formatted: "₹599"
  },
  foamWash: {
    price: 499,
    label: "499",
    formatted: "₹499"
  },
  waxPolish: {
    price: 799,
    label: "799",
    formatted: "₹799"
  },
  dashboardCleaning: {
    price: 199,
    label: "199",
    formatted: "₹199"
  },
  tyreDressing: {
    price: 199,
    label: "199",
    formatted: "₹199"
  },
  premiumDetailing: {
    price: 1999,
    label: "1999",
    formatted: "₹1999"
  }
};

// Export a Proxy to dynamically intercept price reads and merge overrides from LocalStorage in real-time
export const servicePrices: Record<string, PriceConfig> = new Proxy({} as any, {
  get(_, prop: string) {
    const defaults = defaultPrices[prop];
    if (!defaults) return undefined;
    try {
      const overridesRaw = localStorage.getItem("admin_pricing_overrides");
      if (overridesRaw) {
        const overrides = JSON.parse(overridesRaw);
        if (overrides[prop] !== undefined) {
          const val = Number(overrides[prop]);
          return {
            price: val,
            label: String(val),
            formatted: `₹${val}`
          };
        }
      }
    } catch (e) {
      console.warn("Error parsing pricing overrides proxy:", e);
    }
    return defaults;
  }
});
