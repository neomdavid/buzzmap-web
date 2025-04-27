import React, { useState, useEffect } from "react";
import ReactionsTab from "./ReactionsTab";
import ImageGrid from "./ImageGrid";
import { UserDetailsTab } from "../";

const PostCard = ({
  profileImage,
  username,
  timestamp,
  coordinates, // Pass the coordinates here
  dateTime,
  reportType,
  description,
  likes,
  comments,
  shares,
  images = [],
}) => {
  const [geocodedLocation, setGeocodedLocation] = useState(""); // For storing the geocoded address
  const [locationError, setLocationError] = useState(""); // For error handling

  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      // Geocode the coordinates when the component mounts
      geocodeCoordinates(coordinates[0], coordinates[1]);
    }
  }, [coordinates]);

  const geocodeCoordinates = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();

    // Ensure the request is made properly
    const latLng = new window.google.maps.LatLng(lat, lng);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        // Get the formatted address from the first result
        setGeocodedLocation(results[0].formatted_address);
      } else {
        setLocationError("Failed to fetch location name.");
      }
    });
  };

  return (
    <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
      <UserDetailsTab
        profileImage={profileImage}
        username={username}
        timestamp={timestamp}
      />
      <div className="text-primary flex flex-col gap-2">
        <p>
          <span className="font-bold">📍 Location:</span>
          {geocodedLocation || coordinates?.join(", ") || "Unknown location"}
          {locationError && (
            <span className="text-error"> - {locationError}</span>
          )}
        </p>
        <p>
          <span className="font-bold">🕑 Date & Time:</span> {dateTime}
        </p>
        <p>
          <span className="font-bold">⚠️ Report Type:</span> {reportType}
        </p>
        <p className="font-bold">
          📝 Description: <br />
          <span className="font-normal block ml-1">{description}</span>
        </p>
      </div>

      <ImageGrid images={images} />

      <hr className="text-gray-200 mt-4 mb-2" />
      <ReactionsTab likes={likes} comments={comments} shares={shares} />
    </div>
  );
};

export default PostCard;
