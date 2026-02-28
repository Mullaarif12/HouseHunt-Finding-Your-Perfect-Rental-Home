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
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Spinner } from 'react-bootstrap';

const AllUsers = () => {
   const [allUser, setAllUser] = useState([]);
   const [loading, setLoading] = useState(false);
   const [updatingId, setUpdatingId] = useState(null);

   const getAllUser = async () => {
      setLoading(true);
      try {
         const response = await axios.get('http://localhost:8001/api/admin/getallusers', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
         });

         if (response.data.success) {
            setAllUser(response.data.data);
         } else {
            message.error(response.data.message || 'Failed to fetch users');
         }
      } catch (error) {
         console.error(error);
         message.error('Failed to load users');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getAllUser();
   }, []);

   const handleStatus = async (userid, status) => {
      setUpdatingId(userid);
      try {
         const res = await axios.post(
            'http://localhost:8001/api/admin/handlestatus',
            { userid, status },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
         );
         if (res.data.success) {
            message.success(`Owner status changed to: ${status}`);
            getAllUser();
         } else {
            message.error(res.data.message || 'Failed to update status');
         }
      } catch (error) {
         console.error(error);
         message.error('Failed to update owner status');
      } finally {
         setUpdatingId(null);
      }
   };

   if (loading) {
      return (
         <div className="text-center py-5">
            <CircularProgress />
            <p className="mt-2 text-muted">Loading users...</p>
         </div>
      );
   }

   return (
      <div>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="admin users table">
               <TableHead>
                  <TableRow>
                     <TableCell><strong>User ID</strong></TableCell>
                     <TableCell align="center"><strong>Name</strong></TableCell>
                     <TableCell align="center"><strong>Email</strong></TableCell>
                     <TableCell align="center"><strong>Role</strong></TableCell>
                     <TableCell align="center"><strong>Owner Status</strong></TableCell>
                     <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allUser.map((user) => (
                     <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" style={{ fontSize: 11, color: '#666' }}>
                           {user._id}
                        </TableCell>
                        <TableCell align="center">{user.name}</TableCell>
                        <TableCell align="center">{user.email}</TableCell>
                        <TableCell align="center">
                           <Chip
                              label={user.type}
                              color={user.type === 'Admin' ? 'error' : user.type === 'Owner' ? 'primary' : 'default'}
                              size="small"
                           />
                        </TableCell>
                        <TableCell align="center">
                           {user.type === 'Owner' ? (
                              <Chip
                                 label={user.granted === 'granted' ? 'Approved' : 'Pending Approval'}
                                 color={user.granted === 'granted' ? 'success' : 'warning'}
                                 size="small"
                              />
                           ) : '—'}
                        </TableCell>
                        <TableCell align="center">
                           {user.type === 'Owner' && user.granted === 'ungranted' ? (
                              <Button
                                 onClick={() => handleStatus(user._id, 'granted')}
                                 size="small"
                                 variant="contained"
                                 color="success"
                                 disabled={updatingId === user._id}
                              >
                                 {updatingId === user._id ? <CircularProgress size={14} color="inherit" /> : 'Approve Owner'}
                              </Button>
                           ) : user.type === 'Owner' && user.granted === 'granted' ? (
                              <Button
                                 onClick={() => handleStatus(user._id, 'ungranted')}
                                 size="small"
                                 variant="outlined"
                                 color="error"
                                 disabled={updatingId === user._id}
                              >
                                 {updatingId === user._id ? <CircularProgress size={14} color="inherit" /> : 'Revoke Access'}
                              </Button>
                           ) : null}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AllUsers;