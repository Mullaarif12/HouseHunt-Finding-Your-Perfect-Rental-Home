import { message } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { Button, Form, Modal, Col, InputGroup, Row, FloatingLabel, Spinner } from 'react-bootstrap';

const AllProperties = () => {
   const [image, setImage] = useState(null);
   const [editingPropertyId, setEditingPropertyId] = useState(null);
   const [editingPropertyData, setEditingPropertyData] = useState({
      propertyType: '',
      propertyAdType: '',
      propertyAddress: '',
      ownerContact: '',
      propertyAmt: 0,
      additionalInfo: '',
      isAvailable: 'Available',
   });
   const [allProperties, setAllProperties] = useState([]);
   const [show, setShow] = useState(false);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [deleting, setDeleting] = useState(null); // stores propertyId being deleted
   const fileInputRef = useRef(null);

   const handleClose = () => {
      setShow(false);
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
   };

   const handleShow = (propertyId) => {
      const propertyToEdit = allProperties.find((p) => p._id === propertyId);
      if (propertyToEdit) {
         setEditingPropertyId(propertyId);
         setEditingPropertyData({
            propertyType: propertyToEdit.propertyType || 'residential',
            propertyAdType: propertyToEdit.propertyAdType || 'rent',
            propertyAddress: propertyToEdit.propertyAddress || '',
            ownerContact: propertyToEdit.ownerContact || '',
            propertyAmt: propertyToEdit.propertyAmt || 0,
            additionalInfo: propertyToEdit.additionalInfo || '',
            isAvailable: propertyToEdit.isAvailable || 'Available',
         });
         setImage(null);
         setShow(true);
      }
   };

   const getAllProperty = async () => {
      setLoading(true);
      try {
         const response = await axios.get('http://localhost:8001/api/owner/getallproperties', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
         });
         if (response.data.success) {
            setAllProperties(response.data.data);
         } else {
            message.error('Could not load properties');
         }
      } catch (error) {
         console.error(error);
         message.error('Failed to fetch properties');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getAllProperty();
   }, []);

   const handleImageChange = (e) => {
      setImage(e.target.files[0] || null);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setEditingPropertyData((prev) => ({ ...prev, [name]: value }));
   };

   const saveChanges = async (e, propertyId) => {
      e.preventDefault();
      if (!editingPropertyData.propertyAddress.trim()) {
         return message.warning('Address is required');
      }

      const formData = new FormData();
      formData.append('propertyType', editingPropertyData.propertyType);
      formData.append('propertyAdType', editingPropertyData.propertyAdType);
      formData.append('propertyAddress', editingPropertyData.propertyAddress.trim());
      formData.append('ownerContact', editingPropertyData.ownerContact);
      formData.append('propertyAmt', editingPropertyData.propertyAmt);
      formData.append('additionalInfo', editingPropertyData.additionalInfo);
      formData.append('isAvailable', editingPropertyData.isAvailable);

      // Only append image if user selected a new one
      if (image) {
         formData.append('propertyImages', image);
      }

      setSaving(true);
      try {
         const res = await axios.patch(
            `http://localhost:8001/api/owner/updateproperty/${propertyId}`,
            formData,
            {
               headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                  // Do NOT set Content-Type manually; axios sets multipart/form-data with boundary
               },
            }
         );

         if (res.data.success) {
            message.success('✅ Property updated successfully!');
            handleClose();
            getAllProperty(); // Refresh the table
         } else {
            message.error(res.data.message || 'Update failed');
         }
      } catch (error) {
         console.error('Error updating property:', error);
         message.error(error.response?.data?.message || 'Failed to update property');
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async (propertyId) => {
      const confirmed = window.confirm('Are you sure you want to delete this property? This action cannot be undone.');
      if (!confirmed) return;

      setDeleting(propertyId);
      try {
         const response = await axios.delete(
            `http://localhost:8001/api/owner/deleteproperty/${propertyId}`,
            {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
         );

         if (response.data.success) {
            message.success('Property deleted successfully');
            getAllProperty();
         } else {
            message.error(response.data.message || 'Failed to delete');
         }
      } catch (error) {
         console.error(error);
         message.error('Failed to delete property');
      } finally {
         setDeleting(null);
      }
   };

   if (loading) {
      return (
         <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="mt-2 text-muted">Loading your properties...</p>
         </div>
      );
   }

   if (allProperties.length === 0) {
      return (
         <div className="text-center py-5 text-muted">
            <p style={{ fontSize: 18 }}>You haven't listed any properties yet.</p>
            <p>Go to <strong>Add Property</strong> tab to get started!</p>
         </div>
      );
   }

   return (
      <div>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="owner properties table">
               <TableHead>
                  <TableRow>
                     <TableCell><strong>Property Type</strong></TableCell>
                     <TableCell align="center"><strong>Ad Type</strong></TableCell>
                     <TableCell align="center"><strong>Address</strong></TableCell>
                     <TableCell align="center"><strong>Contact</strong></TableCell>
                     <TableCell align="center"><strong>Rent/Price (₹)</strong></TableCell>
                     <TableCell align="center"><strong>Status</strong></TableCell>
                     <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allProperties.map((property) => (
                     <TableRow key={property._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row" style={{ textTransform: 'capitalize' }}>
                           {property.propertyType}
                        </TableCell>
                        <TableCell align="center" style={{ textTransform: 'capitalize' }}>
                           {property.propertyAdType}
                        </TableCell>
                        <TableCell align="center">{property.propertyAddress}</TableCell>
                        <TableCell align="center">{property.ownerContact}</TableCell>
                        <TableCell align="center">₹{Number(property.propertyAmt).toLocaleString()}</TableCell>
                        <TableCell align="center">
                           <Chip
                              label={property.isAvailable || 'Unknown'}
                              color={property.isAvailable === 'Available' ? 'success' : 'error'}
                              size="small"
                           />
                        </TableCell>
                        <TableCell align="center">
                           <Button
                              variant="outline-info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleShow(property._id)}
                           >
                              Edit
                           </Button>

                           <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={deleting === property._id}
                              onClick={() => handleDelete(property._id)}
                           >
                              {deleting === property._id ? <Spinner as="span" size="sm" animation="border" /> : 'Delete'}
                           </Button>

                           {/* Edit Modal — rendered outside the map to avoid stacking issues */}
                           <Modal show={show && editingPropertyId === property._id} onHide={handleClose} size="lg">
                              <Modal.Header closeButton>
                                 <Modal.Title>Edit Property</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                 <Form onSubmit={(e) => saveChanges(e, property._id)}>
                                    <Row className="mb-3">
                                       <Form.Group as={Col} md="4">
                                          <Form.Label>Property Type</Form.Label>
                                          <Form.Select name="propertyType" value={editingPropertyData.propertyType} onChange={handleChange}>
                                             <option value="residential">Residential</option>
                                             <option value="commercial">Commercial</option>
                                             <option value="land/plot">Land / Plot</option>
                                          </Form.Select>
                                       </Form.Group>

                                       <Form.Group as={Col} md="4">
                                          <Form.Label>Listing Type</Form.Label>
                                          <Form.Select name="propertyAdType" value={editingPropertyData.propertyAdType} onChange={handleChange}>
                                             <option value="rent">Rent</option>
                                             <option value="sale">Sale</option>
                                          </Form.Select>
                                       </Form.Group>

                                       <Form.Group as={Col} md="4">
                                          <Form.Label>Availability</Form.Label>
                                          <Form.Select name="isAvailable" value={editingPropertyData.isAvailable} onChange={handleChange}>
                                             <option value="Available">Available</option>
                                             <option value="Unavailable">Unavailable</option>
                                          </Form.Select>
                                       </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                       <Form.Group as={Col} md="12">
                                          <Form.Label>Full Address <span className="text-danger">*</span></Form.Label>
                                          <InputGroup>
                                             <Form.Control
                                                type="text"
                                                placeholder="Address"
                                                name="propertyAddress"
                                                value={editingPropertyData.propertyAddress}
                                                onChange={handleChange}
                                                required
                                             />
                                          </InputGroup>
                                       </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                       <Form.Group as={Col} md="6">
                                          <Form.Label>Replace Image (optional)</Form.Label>
                                          <Form.Control
                                             type="file"
                                             accept="image/*"
                                             ref={fileInputRef}
                                             onChange={handleImageChange}
                                          />
                                          <Form.Text className="text-muted">Leave blank to keep existing image.</Form.Text>
                                       </Form.Group>

                                       <Form.Group as={Col} md="3">
                                          <Form.Label>Owner Contact No.</Form.Label>
                                          <Form.Control
                                             type="tel"
                                             placeholder="Contact number"
                                             name="ownerContact"
                                             value={editingPropertyData.ownerContact}
                                             onChange={handleChange}
                                             required
                                          />
                                       </Form.Group>

                                       <Form.Group as={Col} md="3">
                                          <Form.Label>Rent / Price (₹)</Form.Label>
                                          <Form.Control
                                             type="number"
                                             placeholder="Amount"
                                             name="propertyAmt"
                                             value={editingPropertyData.propertyAmt}
                                             onChange={handleChange}
                                             min="0"
                                          />
                                       </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                       <Col>
                                          <FloatingLabel label="Additional Details">
                                             <Form.Control
                                                as="textarea"
                                                style={{ height: '80px' }}
                                                name="additionalInfo"
                                                value={editingPropertyData.additionalInfo}
                                                onChange={handleChange}
                                                placeholder="Additional details"
                                             />
                                          </FloatingLabel>
                                       </Col>
                                    </Row>

                                    <div className="d-flex justify-content-end gap-2">
                                       <Button variant="outline-secondary" type="button" onClick={handleClose}>
                                          Cancel
                                       </Button>
                                       <Button variant="outline-info" type="submit" disabled={saving}>
                                          {saving ? <><Spinner as="span" size="sm" animation="border" className="me-1" />Saving...</> : 'Save Changes'}
                                       </Button>
                                    </div>
                                 </Form>
                              </Modal.Body>
                           </Modal>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default AllProperties;
