import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '../constant/BaseUrl';
const BookingHistory = () => {
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/booking`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  if (isLoading) return <p className="text-center mt-10">Loading bookings...</p>;
  if (error) return <p className="text-center text-red-500">{error.message}</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">🧾 My Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-6">
          {bookings.map((b, i) => (
            <li key={i} className="flex flex-col md:flex-row justify-between items-start border rounded-lg shadow p-4 bg-white">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-700">{b.room?.title}</h2>
                <p className="text-gray-700">💸 Price: ₹{b.totalAmount}</p>
                <p className="text-gray-700">📅 From: {new Date(b.checkIn).toLocaleDateString()}</p>
                <p className="text-gray-700">📅 To: {new Date(b.checkOut).toLocaleDateString()}</p>
                <p className={
                    `font-medium ${
                        b.paymentStatus === "paid" ? "text-green-600" :
                        b.paymentStatus === "pending" ? "text-yellow-600" :
                        "text-red-600"
                    }`
                    }>
                    Status:{" "}
                    {b.paymentStatus === "paid" && "✅ Paid"}
                    {b.paymentStatus === "pending" && "⏳ Pending"}
                    {b.paymentStatus === "failed" && "❌ Failed"}
                    </p>
              </div>

              {b.room?.image && (
                <img
                  src={b.room.image}
                  alt={b.room.title}
                  className="w-40 h-28 object-cover rounded-md mt-4 md:mt-0 md:ml-6"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingHistory;
