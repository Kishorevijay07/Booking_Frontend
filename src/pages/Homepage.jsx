import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import stayfinder from "./../assets/stayfinder.png";
import { baseUrl } from '../constant/BaseUrl';
const Section = ({ homes }) => {
  // Group homes by city
  const groupedByCity = homes.reduce((acc, home) => {
    const city = home?.address?.city || 'Other';
    if (!acc[city]) acc[city] = [];
    acc[city].push(home);
    return acc;
  }, {});

  const sortedCities = Object.keys(groupedByCity).sort();

  return (
    <div className="px-8 py-6">
      {sortedCities.length > 0 ? (
        sortedCities.map((city) => (
          <div key={city} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">🏙️ Rooms in {city}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {groupedByCity[city].map((home) => (
                <Link to={`/listing/${home._id}`} key={home._id}>
                  <div className="rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-shadow">
                    <img src={home.image} alt={home.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{home.title}</h3>
                      <p className="text-sm text-gray-600">₹{home.price}</p>
                      <p className="text-sm text-gray-500">
                        {home?.address?.street}, {home?.address?.area}, {home?.address?.city}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{home.tag || "Stay"}</span>
                        <span className="text-sm">⭐ {home.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No homes match your search.</p>
      )}
    </div>
  );
};
const AirbnbClone = () => {
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    queryClient.removeQueries(['authUser']); // Clear cached user
    alert('Logout successfully');
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const res = await fetch(`${baseUrl}/auth/getme`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['Listings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
  });

  const filteredHomes = listings.filter((home) => {
    const query = search.toLowerCase();
    return (
      home?.address?.city?.toLowerCase().includes(query) ||
      home?.address?.area?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="shadow-md bg-white sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-8">
            <img src={stayfinder} alt="Stayfinder Logo" className="h-8" />
            <nav className="flex gap-6 text-sm">
              <span className="font-medium border-b-2 border-black pb-1">🏡 Homes</span>
            </nav>
          </div>
          {authUser && <p>Hello Welcome Mr. {authUser.username}</p>}
          <div className="flex items-center gap-4 text-sm">
            {!authUser && <Link to="/login" className="text-blue-600 hover:underline">Login</Link>}
            {authUser && (
              <>
                <Link to="/host">
                  <button className="rounded-full bg-gray-100 p-2">Become a host 🌐</button>
                </Link>
                <button
                  className="rounded-full bg-gray-100 p-2"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  ≡
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center py-4 bg-gray-50">
          <input
            type="text"
            placeholder="Search by city or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[90%] max-w-3xl p-3 border rounded-full shadow focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <p className="text-center mt-10">Loading listings...</p>
      ) : error ? (
        <p className="text-center mt-10 text-red-500">Error: {error.message}</p>
      ) : (
        <Section homes={filteredHomes} />
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 right-0 w-80 h-60 bg-white shadow-lg z-50 p-6">
          <button
            className="absolute top-4 right-4 text-gray-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-4">👤 Profile</h2>
          <p><strong>Username:</strong> {authUser?.username}</p>
          <p><strong>Email:</strong> {authUser?.email}</p>

          <hr className="my-4" />

          <Link
            to="/bookings"
            onClick={() => setIsSidebarOpen(false)}
            className="block text-blue-600 hover:underline mb-2"
          >
            📜 Booking History
          </Link>

          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AirbnbClone;
