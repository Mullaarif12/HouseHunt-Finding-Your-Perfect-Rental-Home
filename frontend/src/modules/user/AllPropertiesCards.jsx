import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, Card, Modal, Carousel, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { message } from 'antd';

const AllPropertiesCards = ({ loggedIn }) => {
   const [carouselIndex, setCarouselIndex] = useState(0);
   const [show, setShow] = useState(false);
   const [allProperties, setAllProperties] = useState([]);
   const [loading, setLoading] = useState(false);
   const [bookingLoading, setBookingLoading] = useState(false);
   const [filterPropertyType, setPropertyType] = useState('');
   const [filterPropertyAdType, setPropertyAdType] = useState('');
   const [filterPropertyAddress, setPropertyAddress] = useState('');
   const [propertyOpen, setPropertyOpen] = useState(null);
   const [userDetails, setUserDetails] = useState({
      fullName: '',
      phone: '',
   });

   const handleUserDetailChange = (e) => {
      const { name, value } = e.target;
      setUserDetails((prev) => ({ ...prev, [name]: value }));
   };

   const handleClose = () => {
      setShow(false);
      setPropertyOpen(null);
      setUserDetails({ fullName: '', phone: '' });
   };

   const handleShow = (propertyId) => {
      setPropertyOpen(propertyId);
      setShow(true);
   };

   const getAllProperties = async () => {
      setLoading(true);
      try {
         const res = await axios.get('http://localhost:8001/api/user/getAllProperties');
         setAllProperties(res.data.data || []);
      } catch (error) {
         console.error(error);
         message.error('Failed to load properties');
      } finally {
         setLoading(false);
      }
   };

   const handleBooking = async (status, propertyId, ownerId) => {
      if (!userDetails.fullName.trim()) {
         return message.warning('Please enter your full name');
      }
      if (!userDetails.phone || String(userDetails.phone).length < 10) {
         return message.warning('Please enter a valid 10-digit phone number');
      }

      setBookingLoading(true);
      try {
         const res = await axios.post(
            `http://localhost:8001/api/user/bookinghandle/${propertyId}`,
            { userDetails, status, ownerId },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
         );

         if (res.data.success) {
            message.success('🎉 Booking request sent! The owner will confirm shortly.');
            handleClose();
            getAllProperties(); // Refresh so availability updates
         } else {
            message.error(res.data.message || 'Booking failed');
         }
      } catch (error) {
         console.error(error);
         message.error('Booking failed. Please try again.');
      } finally {
         setBookingLoading(false);
      }
   };

   useEffect(() => {
      getAllProperties();
   }, []);

   const filteredProperties = allProperties
      .filter((p) => filterPropertyAddress === '' || p.propertyAddress.toLowerCase().includes(filterPropertyAddress.toLowerCase()))
      .filter((p) => filterPropertyAdType === '' || p.propertyAdType.toLowerCase().includes(filterPropertyAdType.toLowerCase()))
      .filter((p) => filterPropertyType === '' || p.propertyType.toLowerCase().includes(filterPropertyType.toLowerCase()));

   if (loading) {
      return (
         <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="mt-2 text-muted">Loading properties...</p>
         </div>
      );
   }

   return (
      <>
         {/* Filter Bar */}
         <div className="mt-4 filter-container text-center">
            <p className="mt-3">Filter By:</p>
            <input
               type="text"
               placeholder="🔍 Search by address..."
               value={filterPropertyAddress}
               onChange={(e) => setPropertyAddress(e.target.value)}
               style={{ marginRight: 8, padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
            />
            <select
               value={filterPropertyAdType}
               onChange={(e) => setPropertyAdType(e.target.value)}
               style={{ marginRight: 8, padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
            >
               <option value="">All Listing Types</option>
               <option value="sale">Sale</option>
               <option value="rent">Rent</option>
            </select>
            <select
               value={filterPropertyType}
               onChange={(e) => setPropertyType(e.target.value)}
               style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ccc' }}
            >
               <option value="">All Property Types</option>
               <option value="commercial">Commercial</option>
               <option value="land/plot">Land / Plot</option>
               <option value="residential">Residential</option>
            </select>
         </div>

         {/* Property Cards */}
         <div className="d-flex flex-wrap mt-4" style={{ gap: 16 }}>
            {filteredProperties.length > 0 ? (
               filteredProperties.map((property) => (
                  <Card border="dark" key={property._id} style={{ width: '18rem' }}>
                     <Card.Body>
                        {/* Thumbnail */}
                        <Card.Title>
                           {property.propertyImage && property.propertyImage.length > 0 ? (
                              <img
                                 src={`http://localhost:8001${property.propertyImage[0].path}`}
                                 alt="Property"
                                 style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 4 }}
                              />
                           ) : (
                              <div
                                 style={{
                                    width: '100%', height: '150px', background: '#f0f0f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 4, color: '#999', fontSize: 14,
                                 }}
                              >
                                 No Image
                              </div>
                           )}
                        </Card.Title>

                        <Card.Text>
                           <p style={{ fontWeight: 600 }} className="my-1">Location:</p> {property.propertyAddress}<br />
                           <p style={{ fontWeight: 600 }} className="my-1">Property Type:</p>
                           <span style={{ textTransform: 'capitalize' }}>{property.propertyType}</span><br />
                           <p style={{ fontWeight: 600 }} className="my-1">Listing Type:</p>
                           <span style={{ textTransform: 'capitalize' }}>{property.propertyAdType}</span><br />

                           {loggedIn && (
                              <>
                                 <p style={{ fontWeight: 600 }} className="my-1">Owner Contact:</p> {property.ownerContact}<br />
                                 <p style={{ fontWeight: 600 }} className="my-1">Availability:</p>
                                 <span style={{ color: property.isAvailable === 'Available' ? 'green' : 'red', fontWeight: 600 }}>
                                    {property.isAvailable || 'Unknown'}
                                 </span><br />
                                 <p style={{ fontWeight: 600 }} className="my-1">Rent / Price:</p> ₹{Number(property.propertyAmt).toLocaleString()}<br />
                              </>
                           )}
                        </Card.Text>

                        {!loggedIn ? (
                           <>
                              <p style={{ fontSize: 12, color: 'orange', marginTop: 8 }}>Login to see full details & book</p>
                              <Link to="/login">
                                 <Button variant="outline-dark" size="sm">Get Info</Button>
                              </Link>
                           </>
                        ) : property.isAvailable === 'Available' ? (
                           <>
                              <p style={{ fontSize: 12, color: 'green', marginTop: 8 }}>Available — click to book</p>
                              <Button
                                 onClick={() => handleShow(property._id)}
                                 variant="outline-dark"
                                 size="sm"
                              >
                                 Get Info & Book
                              </Button>

                              {/* Booking Modal */}
                              <Modal show={show && propertyOpen === property._id} onHide={handleClose} size="lg">
                                 <Modal.Header closeButton>
                                    <Modal.Title>Property Details</Modal.Title>
                                 </Modal.Header>
                                 <Modal.Body>
                                    {/* Image Carousel */}
                                    {property.propertyImage && property.propertyImage.length > 0 && (
                                       <Carousel activeIndex={carouselIndex} onSelect={setCarouselIndex} className="mb-3">
                                          {property.propertyImage.map((img, idx) => (
                                             <Carousel.Item key={idx}>
                                                <img
                                                   src={`http://localhost:8001${img.path}`}
                                                   alt={`Property image ${idx + 1}`}
                                                   className="d-block w-100"
                                                   style={{ maxHeight: '300px', objectFit: 'cover', borderRadius: 6 }}
                                                />
                                             </Carousel.Item>
                                          ))}
                                       </Carousel>
                                    )}

                                    {/* Property Details */}
                                    <div className="d-flex flex-wrap gap-4 my-3">
                                       <div>
                                          <p className="my-1"><b>Owner Contact:</b> {property.ownerContact}</p>
                                          <p className="my-1"><b>Availability:</b> <span style={{ color: 'green' }}>{property.isAvailable}</span></p>
                                          <p className="my-1"><b>Rent / Price:</b> ₹{Number(property.propertyAmt).toLocaleString()}</p>
                                          <p className="my-1"><b>Owner Name:</b> {property.ownerName}</p>
                                       </div>
                                       <div>
                                          <p className="my-1"><b>Location:</b> {property.propertyAddress}</p>
                                          <p className="my-1"><b>Property Type:</b> <span style={{ textTransform: 'capitalize' }}>{property.propertyType}</span></p>
                                          <p className="my-1"><b>Listing Type:</b> <span style={{ textTransform: 'capitalize' }}>{property.propertyAdType}</span></p>
                                       </div>
                                    </div>
                                    {property.additionalInfo && (
                                       <p className="my-1"><b>Additional Info:</b> {property.additionalInfo}</p>
                                    )}

                                    <hr />

                                    {/* Booking Form */}
                                    <h5 className="mb-3">Your Details to Confirm Booking</h5>
                                    <Form onSubmit={(e) => { e.preventDefault(); handleBooking('pending', property._id, property.ownerId); }}>
                                       <Row className="mb-3">
                                          <Form.Group as={Col} md="6">
                                             <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                             <Form.Control
                                                type="text"
                                                placeholder="Your full name"
                                                name="fullName"
                                                value={userDetails.fullName}
                                                onChange={handleUserDetailChange}
                                                required
                                             />
                                          </Form.Group>
                                          <Form.Group as={Col} md="6">
                                             <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                                             <Form.Control
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                name="phone"
                                                value={userDetails.phone}
                                                onChange={handleUserDetailChange}
                                                maxLength={10}
                                                required
                                             />
                                          </Form.Group>
                                       </Row>
                                       <Button type="submit" variant="success" disabled={bookingLoading}>
                                          {bookingLoading
                                             ? <><Spinner as="span" size="sm" animation="border" className="me-1" />Booking...</>
                                             : '📤 Send Booking Request'}
                                       </Button>
                                    </Form>
                                 </Modal.Body>
                              </Modal>
                           </>
                        ) : (
                           <p style={{ color: 'red', fontSize: 13, marginTop: 8, fontWeight: 600 }}>🔒 Not Available</p>
                        )}
                     </Card.Body>
                  </Card>
               ))
            ) : (
               <div className="text-center w-100 py-5 text-muted">
                  <p style={{ fontSize: 18 }}>No properties found matching your filters.</p>
               </div>
            )}
         </div>
      </>
   );
};

export default AllPropertiesCards;