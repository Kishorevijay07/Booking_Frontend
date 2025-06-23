import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const defaultPosition = [13.0827, 80.2707]; // Chennai default

const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
};

const Host = () => {
  const [roomData, setRoomData] = useState({
    title: "",
    price: "",
    description: "",
    address: {
      street: "",
      area: "",
      city: "",
    },
    location: {
      lat: defaultPosition[0],
      lng: defaultPosition[1],
    },
    image: "",
  });

  const fileRef = useRef(null);

  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async (data) => {
      console.log(data)
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create room");
      return result;
    },
    onSuccess: () => {
      toast.success("Room created successfully!");
      setRoomData({
        title: "",
        price: "",
        description: "",
        address: { street: "", area: "", city: "" },
        location: { lat: defaultPosition[0], lng: defaultPosition[1] },
        image: "",
      });
      fileRef.current.value = "";
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setRoomData((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();

      const address = data.address || {};
      const updated = {
        street: address.road || "",
        area: address.suburb || address.neighbourhood || "",
        city: address.city || address.town || address.village || "",
      };

      setRoomData((prev) => ({
        ...prev,
        location: { lat, lng },
        address: updated,
      }));
    } catch (err) {
      toast.error("Could not fetch address from location");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createRoom(roomData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create a Room Listing 🏨</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={roomData.title}
            onChange={handleChange}
            placeholder="Room Title"
            className="w-full p-3 border rounded-md"
            required
          />
          <input
            type="text"
            name="price"
            value={roomData.price}
            onChange={handleChange}
            placeholder="Price per night (₹)"
            className="w-full p-3 border rounded-md"
            required
          />
          <textarea
            name="description"
            value={roomData.description}
            onChange={handleChange}
            placeholder="Room Description"
            className="w-full p-3 border rounded-md"
            rows="3"
            required
          ></textarea>

          {/* Map Location Picker */}
          <div>
            <label className="font-semibold block mb-2 text-gray-700">
              📍 Click on the map to choose location:
            </label>
            <MapContainer
              center={defaultPosition}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "300px", borderRadius: "10px", overflow: "hidden" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <LocationSelector onSelect={reverseGeocode} />
              <Marker position={[roomData.location.lat, roomData.location.lng]} />
            </MapContainer>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p><strong>Street:</strong> {roomData.address.street}</p>
              <p><strong>Area:</strong> {roomData.address.area}</p>
              <p><strong>City:</strong> {roomData.address.city}</p>
            </div>
          </div>

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleImageChange}
            className="w-full"
          />
          {roomData.image && (
            <div className="border-2 border-dashed border-blue-400 rounded-lg p-2 mt-2">
              <img
                src={roomData.image}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-800 transition"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Host;
