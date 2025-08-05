import React from "react";
import type { Venue, TimeRange } from "../types";
import { VENUES, VENUE_COLORS } from "../constants";
import { Filter, Clock, BarChartBig, Landmark } from "lucide-react";

interface ControlPanelProps {
  selectedVenues: Set<Venue>;
  toggleVenue: (venue: Venue) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  quantityThreshold: number;
  setQuantityThreshold: (threshold: number) => void;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  basePrice: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedVenues,
  toggleVenue,
  priceRange,
  setPriceRange,
  quantityThreshold,
  setQuantityThreshold,
  timeRange,
  setTimeRange,
  basePrice,
}) => {
  const timeRanges: TimeRange[] = ["1m", "5m", "15m", "1h"];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Landmark size={18} className="text-cyan-400" />
          Trading Venues
        </h3>
        <div className="space-y-2">
          {VENUES.map((venue:any) => (
            <label
              key={venue}
              className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedVenues.has(venue)}
                onChange={() => toggleVenue(venue)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
              />
              <span className="flex-1 text-sm">{venue}</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: VENUE_COLORS[venue] }}
              ></div>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Filter size={18} className="text-cyan-400" />
          Filters
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Min Quantity
            </label>
            <input
              type="range"
              id="quantity"
              min="0"
              max="10"
              step="0.1"
              value={quantityThreshold}
              onChange={(e) => setQuantityThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {quantityThreshold.toFixed(1)} BTC
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Price Range (% of Base)
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              defaultValue="0.2"
              onChange={(e) => {
                const percentage = parseFloat(e.target.value) / 100;
                setPriceRange([
                  basePrice * (1 - percentage),
                  basePrice * (1 + percentage),
                ]);
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              ${priceRange[0].toFixed(0)} - ${priceRange[1].toFixed(0)}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" />
          Time Range (History)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? "bg-cyan-500 text-white shadow-lg"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-md font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <BarChartBig size={18} className="text-cyan-400" />
          Advanced Views
        </h3>
        <div className="space-y-2">
          <button
            disabled
            className="w-full text-left p-2 rounded-md bg-gray-800 text-gray-500 cursor-not-allowed text-sm"
          >
            Volume Profile (Soon)
          </button>
          <button
            disabled
            className="w-full text-left p-2 rounded-md bg-gray-800 text-gray-500 cursor-not-allowed text-sm"
          >
            Order Flow (Soon)
          </button>
        </div>
      </section>
    </div>
  );
};
