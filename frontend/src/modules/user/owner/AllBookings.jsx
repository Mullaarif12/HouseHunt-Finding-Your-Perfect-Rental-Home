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
import { Button, Spinner } from 'react-bootstrap';

const OwnerAllBookings = () => {
   const [allBookings, setAllBookings] = useState([]);
   const [loading, setLoading] = useState(false);
   const [updatingId, setUpdatingId] = useState(null);

   const getAllBookings = async () => {
      setLoading(true);
      try {
         const response = await axios.get('http://localhost:8001/api/owner/getallbookings', {
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
      getAllBookings();
   }, []);

   const handleStatus = async (bookingId, propertyId, newStatus) => {
      if (!propertyId) {
         message.error('Property ID missing — cannot update booking.');
         return;
      }
      setUpdatingId(bookingId);
      try {
         const res = await axios.post(
            'http://localhost:8001/api/owner/handlebookingstatus',
            { bookingId, propertyId, status: newStatus },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
         );

         if (res.data.success) {
            message.success(`Booking status → ${newStatus}`);
            getAllBookings();
         } else {
            message.error('Failed to update booking status');
         }
      } catch (error) {
         console.error(error);
         message.error('Something went wrong');
      } finally {
         setUpdatingId(null);
      }
   };

   if (loading) {
      return (
         <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="mt-2 text-muted">Loading bookings...</p>
         </div>
      );
   }

   if (allBookings.length === 0) {
      return (
         <div className="text-center py-5 text-muted">
            <p style={{ fontSize: 18 }}>No booking requests yet.</p>
            <p>Bookings from renters will appear here.</p>
         </div>
      );
   }

   return (
      <div>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="owner bookings table">
               <TableHead>
                  <TableRow>
                     <TableCell><strong>Booking ID</strong></TableCell>
                     <TableCell align="center"><strong>Property ID</strong></TableCell>
                     <TableCell align="center"><strong>Tenant Name</strong></TableCell>
                     <TableCell align="center"><strong>Tenant Phone</strong></TableCell>
                     <TableCell align="center"><strong>Status</strong></TableCell>
                     <TableCell align="center"><strong>Action</strong></TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allBookings.map((booking) => (
                     <TableRow key={booking._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" style={{ fontSize: 12, color: '#666' }}>
                           {booking._id}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: 12, color: '#666' }}>
                           {booking.propertyId ? String(booking.propertyId) : '—'}
                        </TableCell>
                        <TableCell align="center">{booking.userName}</TableCell>
                        <TableCell align="center">{booking.phone}</TableCell>
                        <TableCell align="center">
                           <Chip
                              label={booking.bookingStatus}
                              color={booking.bookingStatus === 'booked' ? 'success' : booking.bookingStatus === 'pending' ? 'warning' : 'default'}
                              size="small"
                              style={{ textTransform: 'capitalize' }}
                           />
                        </TableCell>
                        <TableCell align="center">
                           {booking.bookingStatus === 'pending' ? (
                              <Button
                                 variant="outline-success"
                                 size="sm"
                                 disabled={updatingId === booking._id}
                                 onClick={() => handleStatus(booking._id, booking.propertyId, 'booked')}
                              >
                                 {updatingId === booking._id
                                    ? <Spinner as="span" size="sm" animation="border" />
                                    : '✅ Approve'}
                              </Button>
                           ) : (
                              <Button
                                 variant="outline-warning"
                                 size="sm"
                                 disabled={updatingId === booking._id}
                                 onClick={() => handleStatus(booking._id, booking.propertyId, 'pending')}
                              >
                                 {updatingId === booking._id
                                    ? <Spinner as="span" size="sm" animation="border" />
                                    : '↩ Cancel'}
                              </Button>
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default OwnerAllBookings;
