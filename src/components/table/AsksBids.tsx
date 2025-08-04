"use client";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { OrderbookLevel } from "@/types/orderbook";

const AsksBids = () => {
  const { snapshot } = useSelector((state: RootState) => state.orderbook);

  const processedData = useMemo(() => {
    if (!snapshot) return null;

    // Get the latest 15 levels for asks and bids
    const asks = Array.from(snapshot.asks.values()).flat().slice(-15).reverse();
    const bids = Array.from(snapshot.bids.values()).flat().slice(0, 15);

    return {
      bids,
      asks,
    };
  }, [snapshot]);

  if (!processedData) {
    return <div className="text-center text-gray-400 p-4">Waiting for data...</div>;
  }

  const { bids, asks } = processedData;

  const renderTableRow = (level: OrderbookLevel, type: 'ask' | 'bid') => {
    const priceColor = type === 'ask' ? 'text-red-400' : 'text-green-400';
    return (
      <tr key={`${type}-${level.price}-${level.timestamp}`} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-700">
        <td className={`px-4 py-1 font-mono ${priceColor}`}>{level.price.toFixed(2)}</td>
        <td className="px-4 py-1 font-mono">{level.quantity.toFixed(4)}</td>
        <td className="px-4 py-1 font-mono text-gray-500">{new Date(level.timestamp).toLocaleTimeString()}</td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full text-white bg-gray-950">
      {/* Asks Table (Upper Half) */}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-red-400 p-2 sticky top-0 bg-gray-950 z-10">Asks</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-2">Price (USD)</th>
              <th scope="col" className="px-4 py-2">Quantity</th>
              <th scope="col" className="px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {asks.map(level => renderTableRow(level, 'ask'))}
          </tbody>
        </table>
      </div>

      {/* Bids Table (Lower Half) */}
      <div className="flex-1 overflow-y-auto border-t-2 border-gray-700">
        <h2 className="text-lg font-semibold text-green-400 p-2 sticky top-0 bg-gray-950 z-10">Bids</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-2">Price (USD)</th>
              <th scope="col" className="px-4 py-2">Quantity</th>
              <th scope="col" className="px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {bids.map(level => renderTableRow(level, 'bid'))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsksBids;
