export interface PriceConfig {
  price: number;
  label: string;
  formatted: string;
}

const defaultPrices: Record<string, PriceConfig> = {
  "subscription-small": {
    price: 800,
    label: "800",
    formatted: "₹800"
  },
  "subscription-big": {
    price: 1500,
    label: "1500",
    formatted: "₹1500"
  },
  "one-time-full": {
    price: 0,
    label: "",
    formatted: ""
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
