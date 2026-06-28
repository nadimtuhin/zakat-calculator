import React, { useState, useEffect } from "react";
import {
  Calculator,
  Heart,
  DollarSign,
  Coins,
  Gem,
  Building2,
  Briefcase,
  RotateCcw,
} from "lucide-react";
import currency from "currency.js";

interface Asset {
  id: string;
  type: string;
  amount: number;
  description?: string;
  weight?: number;
  unit?: MetalUnit;
}

interface MetalPrices {
  gold: number;
  silver: number;
}

type MetalUnit = "g" | "oz" | "vori" | "carat21" | "carat22" | "roti";

interface Country {
  name: string;
  currency: string;
  symbol: string;
  rate: number;
}

const countries: Country[] = [
  { name: "United States", currency: "USD", symbol: "$", rate: 1 },
  { name: "Bangladesh", currency: "BDT", symbol: "৳", rate: 109.85 },
  { name: "India", currency: "INR", symbol: "₹", rate: 83.37 },
  { name: "Malaysia", currency: "MYR", symbol: "RM", rate: 4.77 },
  { name: "Maldives", currency: "MVR", symbol: "Rf", rate: 15.45 },
  { name: "United Kingdom", currency: "GBP", symbol: "£", rate: 0.79 },
  { name: "Saudi Arabia", currency: "SAR", symbol: "﷼", rate: 3.75 },
  { name: "UAE", currency: "AED", symbol: "د.إ", rate: 3.67 },
  { name: "Pakistan", currency: "PKR", symbol: "₨", rate: 278.5 },
  { name: "Indonesia", currency: "IDR", symbol: "Rp", rate: 15785 },
  { name: "Turkey", currency: "TRY", symbol: "₺", rate: 31.93 },
];

const NISAB_GOLD_WEIGHT = 85; // 85 grams of gold
const ZAKAT_RATE = 0.025; // 2.5%

const METAL_PRICE_API_BASE = 'https://api.metalpriceapi.com/v1';
const METAL_PRICE_API_KEY = import.meta.env.VITE_METAL_PRICE_API_KEY;

function App() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    const savedCountry = localStorage.getItem("selectedCountry");
    return savedCountry
      ? JSON.parse(savedCountry)
      : countries.find((c) => c.name === "Bangladesh") || countries[0];
  });
  const [metalPrices, setMetalPrices] = useState<MetalPrices>({
    gold: 0,
    silver: 0,
  });
  const [goldWeight, setGoldWeight] = useState(0);
  const [silverWeight, setSilverWeight] = useState(0);
  const [goldUnit, setGoldUnit] = useState<MetalUnit>("g");
  const [silverUnit, setSilverUnit] = useState<MetalUnit>("g");
  const [loading, _setLoading] = useState(true);
  const [error, _setError] = useState("");

  useEffect(() => {
    async function fetchMetalPrices() {
      try {
        const response = await fetch(
          `${METAL_PRICE_API_BASE}/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,XAG`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch metal prices');
        }

        const data = await response.json();
        
        // Convert from troy ounce to gram (1 troy oz = 31.1034768 grams)
        const troyOunceToGram = 31.1034768;
        
        setMetalPrices({
          // XAU is gold price per troy ounce, convert to price per gram
          gold: data.rates.XAU ? (1 / data.rates.XAU) / troyOunceToGram : 0,
          // XAG is silver price per troy ounce, convert to price per gram
          silver: data.rates.XAG ? (1 / data.rates.XAG) / troyOunceToGram : 0,
        });
      } catch (error) {
        console.error('Error fetching metal prices:', error);
      }
    }

    fetchMetalPrices();
    // Fetch prices every 60 seconds (or according to your API plan)
    const interval = setInterval(fetchMetalPrices, 60000);

    return () => clearInterval(interval);
  }, []);

  const [assets, setAssets] = useState<Asset[]>([
    { type: "Cash & Bank Balances", amount: 0 },
    { type: "Gold", amount: goldWeight * (metalPrices.gold / 31.1035) }, // Convert from grams to troy ounces
    { type: "Silver", amount: silverWeight * (metalPrices.silver / 31.1035) },
    { type: "Investments & Shares", amount: 0 },
    { type: "Property for Business", amount: 0 },
    { type: "Business Inventory", amount: 0 },
  ]);

  const [assetGroups, setAssetGroups] = useState<Record<string, Asset[]>>(
    () => {
      const savedAssetGroups = localStorage.getItem("assetGroups");
      return savedAssetGroups
        ? JSON.parse(savedAssetGroups)
        : {
            "Cash & Bank Balances": [
              {
                id: crypto.randomUUID(),
                type: "Cash & Bank Balances",
                amount: 0,
                description: "Cash in hand",
              },
            ],
            Gold: [
              {
                id: crypto.randomUUID(),
                type: "Gold",
                amount: goldWeight * (metalPrices.gold / 31.1035),
                weight: goldWeight,
                unit: goldUnit,
                description: "Gold jewelry",
              },
            ],
            Silver: [
              {
                id: crypto.randomUUID(),
                type: "Silver",
                amount: silverWeight * (metalPrices.silver / 31.1035),
                weight: silverWeight,
                unit: silverUnit,
                description: "Silver items",
              },
            ],
            "Investments & Shares": [
              {
                id: crypto.randomUUID(),
                type: "Investments & Shares",
                amount: 0,
                description: "Stocks",
              },
            ],
            "Property for Business": [
              {
                id: crypto.randomUUID(),
                type: "Property for Business",
                amount: 0,
                description: "Commercial property",
              },
            ],
            "Business Inventory": [
              {
                id: crypto.randomUUID(),
                type: "Business Inventory",
                amount: 0,
                description: "Current inventory",
              },
            ],
          };
    }
  );

  useEffect(() => {
    localStorage.setItem("selectedCountry", JSON.stringify(selectedCountry));
    localStorage.setItem("assetGroups", JSON.stringify(assetGroups));
  }, [selectedCountry, assetGroups]);

  const handleReset = () => {
    localStorage.removeItem("selectedCountry");
    localStorage.removeItem("assetGroups");
    setSelectedCountry(
      countries.find((c) => c.name === "Bangladesh") || countries[0]
    );
    setAssetGroups({
      "Cash & Bank Balances": [
        {
          id: crypto.randomUUID(),
          type: "Cash & Bank Balances",
          amount: 0,
          description: "Cash in hand",
        },
      ],
      Gold: [
        {
          id: crypto.randomUUID(),
          type: "Gold",
          amount: 0,
          weight: 0,
          unit: "g",
          description: "Gold jewelry",
        },
      ],
      Silver: [
        {
          id: crypto.randomUUID(),
          type: "Silver",
          amount: 0,
          weight: 0,
          unit: "g",
          description: "Silver items",
        },
      ],
      "Investments & Shares": [
        {
          id: crypto.randomUUID(),
          type: "Investments & Shares",
          amount: 0,
          description: "Stocks",
        },
      ],
      "Property for Business": [
        {
          id: crypto.randomUUID(),
          type: "Property for Business",
          amount: 0,
          description: "Commercial property",
        },
      ],
      "Business Inventory": [
        {
          id: crypto.randomUUID(),
          type: "Business Inventory",
          amount: 0,
          description: "Current inventory",
        },
      ],
    });
  };

  const totalWealth = Object.values(assetGroups)
    .flat()
    .reduce((sum, asset) => sum + asset.amount, 0);
  const nisabValue = (NISAB_GOLD_WEIGHT / 31.1035) * metalPrices.gold; // Convert 85g to troy ounces and multiply by gold price
  const zakatPayable = totalWealth >= nisabValue;
  const zakatAmount = zakatPayable ? totalWealth * ZAKAT_RATE : 0;

  const convertToGrams = (weight: number, unit: MetalUnit): number => {
    const conversionFactors = {
      g: 1,
      oz: 31.1035,
      vori: 11.664, // 1 vori = 11.664 grams
      carat21: 1, // Same weight but different purity
      carat22: 1, // Same weight but different purity
      roti: 0.972, // 1 roti = 0.972 grams
    };
    return weight * conversionFactors[unit];
  };

  const getPurityFactor = (unit: MetalUnit): number => {
    switch (unit) {
      case "carat21":
        return 0.875; // 21/24 karat
      case "carat22":
        return 0.916; // 22/24 karat
      default:
        return 1;
    }
  };

  const handleMetalWeightChange = (
    metal: "gold" | "silver",
    weight: number
  ) => {
    const conversionFactor = 31.1035; // grams per troy ounce

    if (metal === "gold") {
      setGoldWeight(weight);
      const newAssets = [...assets];
      const weightInGrams = convertToGrams(weight, goldUnit);
      const purityFactor = getPurityFactor(goldUnit);
      const weightInOunces = (weightInGrams / conversionFactor) * purityFactor;
      newAssets[1].amount = weightInOunces * metalPrices.gold;
      setAssets(newAssets);
    } else {
      setSilverWeight(weight);
      const newAssets = [...assets];
      const weightInGrams = convertToGrams(weight, silverUnit);
      const purityFactor = getPurityFactor(silverUnit);
      const weightInOunces = (weightInGrams / conversionFactor) * purityFactor;
      newAssets[2].amount = weightInOunces * metalPrices.silver;
      setAssets(newAssets);
    }
  };

  const _handleUnitChange = (metal: "gold" | "silver", unit: MetalUnit) => {
    const conversionFactor = 31.1035;

    if (metal === "gold") {
      const newWeight =
        unit === "g"
          ? goldWeight * conversionFactor
          : goldWeight / conversionFactor;
      setGoldUnit(unit);
      setGoldWeight(newWeight);
      handleMetalWeightChange("gold", newWeight);
    } else {
      const newWeight =
        unit === "g"
          ? silverWeight * conversionFactor
          : silverWeight / conversionFactor;
      setSilverUnit(unit);
      setSilverWeight(newWeight);
      handleMetalWeightChange("silver", newWeight);
    }
  };

  const _handleAssetChange = (index: number, value: number) => {
    const newAssets = [...assets];
    newAssets[index].amount = value;
    setAssets(newAssets);
  };

  const getIconForAssetType = (type: string) => {
    switch (type) {
      case "Cash & Bank Balances":
        return <DollarSign className="w-5 h-5" />;
      case "Gold":
        return <Coins className="w-5 h-5" />;
      case "Silver":
        return <Coins className="w-5 h-5" />;
      case "Investments & Shares":
        return <Gem className="w-5 h-5" />;
      case "Property for Business":
        return <Building2 className="w-5 h-5" />;
      case "Business Inventory":
        return <Briefcase className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return currency(amount, { symbol: selectedCountry.symbol }).format();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/nadimtuhin/zakat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  height="24"
                  viewBox="0 0 16 16"
                  width="24"
                  className="fill-current"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                <span>View on GitHub</span>
              </a>
            </div>
            <a
              href="https://github.com/nadimtuhin/zakat/stargazers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-sm text-gray-700"
            >
              <svg
                className="w-4 h-4 mr-2 fill-current text-yellow-500"
                viewBox="0 0 16 16"
              >
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
              </svg>
              Star
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Calculator className="w-10 h-10 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Zakat Calculator
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <select
                value={selectedCountry.name}
                onChange={(e) =>
                  setSelectedCountry(
                    countries.find((c) => c.name === e.target.value) ||
                      countries[0]
                  )
                }
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {countries.map((country) => (
                  <option key={country.currency} value={country.name}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(assetGroups).map(([type, assets]) => (
              <div key={type} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    {getIconForAssetType(type)}
                    <label className="text-gray-700 font-medium">{type}</label>
                  </div>
                  <button
                    onClick={() => {
                      const newAsset = {
                        id: crypto.randomUUID(),
                        type,
                        amount: 0,
                        description: "",
                        ...(type === "Gold" || type === "Silver"
                          ? { weight: 0, unit: "g" }
                          : {}),
                      };
                      setAssetGroups((prev) => ({
                        ...prev,
                        [type]: [...prev[type], newAsset],
                      }));
                    }}
                    className="px-3 py-1 text-sm bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                  >
                    + Add Entry
                  </button>
                </div>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex gap-4 mb-2">
                        <input
                          type="text"
                          value={asset.description}
                          onChange={(e) => {
                            const newAssets = [...assetGroups[type]];
                            const index = newAssets.findIndex(
                              (a) => a.id === asset.id
                            );
                            newAssets[index] = {
                              ...newAssets[index],
                              description: e.target.value,
                            };
                            setAssetGroups((prev) => ({
                              ...prev,
                              [type]: newAssets,
                            }));
                          }}
                          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md"
                          placeholder="Description"
                        />
                        {assets.length > 1 && (
                          <button
                            onClick={() => {
                              setAssetGroups((prev) => ({
                                ...prev,
                                [type]: prev[type].filter(
                                  (a) => a.id !== asset.id
                                ),
                              }));
                            }}
                            className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {type === "Gold" || type === "Silver" ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={asset.weight}
                            onChange={(e) => {
                              const weight = parseFloat(e.target.value) || 0;
                              const newAssets = [...assetGroups[type]];
                              const index = newAssets.findIndex(
                                (a) => a.id === asset.id
                              );
                              const weightInGrams = convertToGrams(
                                weight,
                                asset.unit || "g"
                              );
                              const purityFactor = getPurityFactor(
                                asset.unit || "g"
                              );
                              const weightInOunces =
                                (weightInGrams / 31.1035) * purityFactor;
                              newAssets[index] = {
                                ...newAssets[index],
                                weight,
                                amount:
                                  weightInOunces *
                                  metalPrices[
                                    type.toLowerCase() as "gold" | "silver"
                                  ],
                              };
                              setAssetGroups((prev) => ({
                                ...prev,
                                [type]: newAssets,
                              }));
                            }}
                            className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={`Enter weight in ${asset.unit || "g"}`}
                          />
                          <select
                            value={asset.unit || "g"}
                            onChange={(e) => {
                              const unit = e.target.value as MetalUnit;
                              const newAssets = [...assetGroups[type]];
                              const index = newAssets.findIndex(
                                (a) => a.id === asset.id
                              );
                              newAssets[index] = { ...newAssets[index], unit };
                              setAssetGroups((prev) => ({
                                ...prev,
                                [type]: newAssets,
                              }));
                            }}
                            className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                          >
                            <option value="g">Gram (g)</option>
                            <option value="oz">Troy Ounce (oz)</option>
                            <option value="vori">Vori (বরি)</option>
                            <option value="carat21">21 Carat</option>
                            <option value="carat22">22 Carat</option>
                            <option value="roti">Roti (রতি)</option>
                          </select>
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={asset.amount}
                          onChange={(e) => {
                            const newAssets = [...assetGroups[type]];
                            const index = newAssets.findIndex(
                              (a) => a.id === asset.id
                            );
                            newAssets[index] = {
                              ...newAssets[index],
                              amount: parseFloat(e.target.value) || 0,
                            };
                            setAssetGroups((prev) => ({
                              ...prev,
                              [type]: newAssets,
                            }));
                          }}
                          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter amount"
                        />
                      )}
                      {(type === "Gold" || type === "Silver") && (
                        <div className="mt-2 text-sm text-gray-600">
                          Current value: {formatCurrency(asset.amount)}
                          {loading && " (Loading prices...)"}
                          {error && ` (${error})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-emerald-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Total Wealth:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalWealth)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">
                Nisab Threshold:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(nisabValue * selectedCountry.rate)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-emerald-600" />
                <span className="text-gray-700 font-medium">
                  Zakat Payable:
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(zakatAmount)}
              </span>
            </div>

            {!zakatPayable && (
              <p className="mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg">
                Note: Zakat is only payable if your total wealth exceeds the
                Nisab value of{" "}
                {formatCurrency(nisabValue * selectedCountry.rate)}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
