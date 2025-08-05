"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setShowNoVenuePopup, toggleVenue } from "@/store/filterslice";
import { VenueId } from "@/types/venue";
import webSocketManager from "@/lib/api/websocket";

const ControlPanel = () => {
  const dispatch = useDispatch();
  const { venues } = useSelector((state: RootState) => state.filters);
  const novenueselected=useSelector((state:RootState)=>state.filters.showNoVenuePopup)
  const enabledVenues = Object.keys(venues).filter(
      (venue) => venues[venue as keyof typeof venues].enabled
    );
  
    useEffect(() => {
      if (enabledVenues.length === 0) {
        dispatch(setShowNoVenuePopup(true));
        // console.log("No venue selected",novenueselected);
        // return () => clearTimeout(timer);
      }
      else{
        dispatch(setShowNoVenuePopup(false));
        // console.log("No venue selected", novenueselected);
      }
    }, [enabledVenues]);

  const handleVenueToggle = (venue: string) => {
    const venueId = venue as VenueId;
    dispatch(toggleVenue(venueId));

    const client = webSocketManager.getClient(venueId);
    if (client) {
      if (venues[venueId].enabled) {
        client.disconnect();
      } else {
        client.connect();
      }
    }
  };

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
      <div>
        <h4 className="text-md font-semibold text-white mb-2">Venues</h4>
        <div className="flex flex-col space-y-2">
          {(Object.keys(venues) as VenueId[]).map((venue) => (
            <label key={venue} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={venues[venue].enabled}
                onChange={() => handleVenueToggle(venue)}
                className="form-checkbox h-5 w-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-white">{venue}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
