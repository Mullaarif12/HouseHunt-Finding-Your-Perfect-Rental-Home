import { message } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

const AdminAllBookings = () => {
   const [allBookings, setAllBookings] = useState([]);
   const [loading, setLoading] = useState(false);

   const getAllBooking = async () => {
      setLoading(true);
      try {
         const response = await axios.get('http://localhost:8001/api/admin/getallbookings', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
         });

         if (response.data.success) {
            setAllBookings(response.data.data);
         } else {
            message.error(response.data.message || 'Failed to fetch bookings');
         }
      } catch (error) {
         console.error(error);
         message.error('Failed to load bookings');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getAllBooking();
   }, []);

   if (loading) {
      return (
         <div className="text-center py-5">
            <CircularProgress />
            <p className="mt-2 text-muted">Loading bookings...</p>
         </div>
      );
   }

   if (allBookings.length === 0) {
      return (
         <div className="text-center py-5 text-muted">
            <p style={{ fontSize: 18 }}>No bookings found in the system.</p>
         </div>
      );
   }

   return (
      <div>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="admin bookings table">
               <TableHead>
                  <TableRow>
                     <TableCell><strong>Booking ID</strong></TableCell>
                     <TableCell align="center"><strong>Owner ID</strong></TableCell>
                     <TableCell align="center"><strong>Property ID</strong></TableCell>
                     <TableCell align="center"><strong>Tenant ID</strong></TableCell>
                     <TableCell align="center"><strong>Tenant Name</strong></TableCell>
                     <TableCell align="center"><strong>Contact</strong></TableCell>
                     <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allBookings.map((booking) => (
                     <TableRow key={booking._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" style={{ fontSize: 11, color: '#666' }}>
                           {booking._id}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: 11, color: '#666' }}>
                           {booking.ownerID ? String(booking.ownerID) : '—'}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: 11, color: '#666' }}>
                           {booking.propertyId ? String(booking.propertyId) : '—'}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: 11, color: '#666' }}>
                           {booking.userID ? String(booking.userID) : '—'}
                        </TableCell>
                        <TableCell align="center">{booking.userName}</TableCell>
                        <TableCell align="center">{booking.phone}</TableCell>
                        <TableCell align="center">
                           <Chip
                              label={booking.bookingStatus}
                              color={
                                 booking.bookingStatus === 'booked'
                                    ? 'success'
                                    : booking.bookingStatus === 'pending'
                                       ? 'warning'
                                       : 'default'
                              }
                              size="small"
                              style={{ textTransform: 'capitalize' }}
                           />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AdminAllBookings;