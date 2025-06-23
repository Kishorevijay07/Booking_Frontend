import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { baseUrl } from '../constant/BaseUrl';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const RoomDetails = () => {
  const { id } = useParams();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

const { data: room, isLoading, error } = useQuery({
  queryKey: ['roomDetails', id],
  queryFn: async () => {
    const res = await fetch(`${baseUrl}/listings/${id}`);
    if (!res.ok) throw new Error("Failed to fetch room details");
    return res.json();
  },
});


  if (isLoading) return <p className="text-center mt-10 text-lg">Loading room details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500 text-lg">Error: {error.message}</p>;

  const position = [room.location.lat, room.location.lng];

  const calculateDays = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const totalDays = calculateDays();
  const totalPrice = totalDays * parseFloat(room.price);

  const handlePayment = async () => {
  if (!checkIn || !checkOut || totalDays <= 0) {
    alert("Please select valid check-in and check-out dates.");
    return;
  }
    const token = localStorage.getItem("token");

    if(!token){
      alert("❌ Please Login , Befote Book the room" );
      return;
    }


  try {

    const res = await fetch(`${baseUrl}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomId: id,
        checkIn,
        checkOut,
      }),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.error || "Booking failed");

    // ✅ Redirect to Stripe checkout
    if (res.ok) 
      alert("Booking created");

  } catch (err) {
    alert("❌ Error: " + err.message);

  }
};


  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{room.title}</h1>
        <p className="text-gray-500 text-sm">
          {room?.address?.street}, {room?.address?.area}, {room?.address?.city}
        </p>
      </div>

      <img
        src={room.image}
        alt={room.title}
        className="w-full h-[400px] object-cover rounded-xl shadow"
      />

      <div className="mt-6">
        <p className="text-lg text-gray-700">{room.description}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 text-gray-800">
          <p><strong className="text-gray-600">💰 Price:</strong> ₹{room.price} / night</p>
          <p><strong className="text-gray-600">📍 Street:</strong> {room?.address?.street}</p>
          <p><strong className="text-gray-600">🏘️ Area:</strong> {room?.address?.area}</p>
          <p><strong className="text-gray-600">🌆 City:</strong> {room?.address?.city}</p>
        </div>

        {/* Leaflet Map */}
        <div className="rounded-lg overflow-hidden shadow-md h-64">
          <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={position}>
              <Popup>
                {room.title} <br /> {room?.address?.area}, {room?.address?.city}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Booking Section */}
      <div className="mt-10 bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Book this Room 🛏️</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Check-in:</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Check-out:</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {totalDays > 0 && (
          <p className="mt-4 text-lg font-semibold text-green-700">
            Total for {totalDays} night(s): ₹{totalPrice}
          </p>
        )}

        <button
          onClick={handlePayment}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition"
        >
          Pay Now 💳
        </button>
      </div>
    </div>
  );
};

export default RoomDetails;
