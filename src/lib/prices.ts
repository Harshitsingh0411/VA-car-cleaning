export interface PriceConfig {
  price: number;
  label: string;
  formatted: string;
}

const defaultPrices: Record<string, PriceConfig> = {};

// Export a Proxy to dynamically intercept price reads and merge overrides from LocalStorage in real-time
export const servicePrices: Record<string, PriceConfig> = new Proxy({} as any, {
  get(_, prop: string) {
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
    return defaultPrices[prop] || { price: 0, label: "0", formatted: "₹0" };
  }
});
