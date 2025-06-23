import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { useQuery } from '@tanstack/react-query';
import Host from './pages/Host.jsx';
import RoomDetails from './pages/RoomDetails.jsx';
import BookingHistory from './pages/BookingHistory.jsx';
function App() {

  const {data:authUser}=useQuery({
  
    queryKey:["authUser"],
    queryFn:async()=>{
      try {
        const token = localStorage.getItem('token');
        console.log("The Token Before Get",token)
        const res = await fetch(`	http://localhost:3000/auth/getme`,{
          method:"GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });   

        const data = await res.json();

        if(data.error){
          return null
        }
        if(!res.ok){
          throw new Error(data.error || "Something went Wronng")
        };
        console.log("Auth User in APp js",data);
        return data;
      } catch (error) {
        throw error;
      }
    }
  })

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/host" element={<Host/>}/>
      <Route path="/listing/:id" element={<RoomDetails />} />
      <Route path="/bookings" element={<BookingHistory />} />
    </Routes>
  );
}

export default App;

