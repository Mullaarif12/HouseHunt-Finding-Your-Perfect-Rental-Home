import React, { useState, useRef } from 'react';
import { Container, Button, Col, Form, InputGroup, Row, FloatingLabel, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { message } from 'antd';

const INITIAL_STATE = {
   propertyType: 'residential',
   propertyAdType: 'rent',
   propertyAddress: '',
   ownerContact: '',
   propertyAmt: '',
   additionalInfo: '',
};

function AddProperty() {
   const [propertyDetails, setPropertyDetails] = useState(INITIAL_STATE);
   const [images, setImages] = useState(null);
   const [loading, setLoading] = useState(false);
   const fileInputRef = useRef(null);

   const handleImageChange = (e) => {
      setImages(e.target.files);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setPropertyDetails((prev) => ({ ...prev, [name]: value }));
   };

   const resetForm = () => {
      setPropertyDetails(INITIAL_STATE);
      setImages(null);
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!propertyDetails.propertyAddress.trim()) {
         return message.warning('Please enter the property address');
      }
      if (!propertyDetails.ownerContact) {
         return message.warning('Please enter a contact number');
      }
      if (!images || images.length === 0) {
         return message.warning('Please upload at least one property image');
      }

      const formData = new FormData();
      formData.append('propertyType', propertyDetails.propertyType);
      formData.append('propertyAdType', propertyDetails.propertyAdType);
      formData.append('propertyAddress', propertyDetails.propertyAddress.trim());
      formData.append('ownerContact', propertyDetails.ownerContact);
      formData.append('propertyAmt', propertyDetails.propertyAmt || 0);
      formData.append('additionalInfo', propertyDetails.additionalInfo);

      for (let i = 0; i < images.length; i++) {
         formData.append('propertyImages', images[i]);
      }

      setLoading(true);
      try {
         const res = await axios.post('http://localhost:8001/api/owner/postproperty', formData, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               // Do NOT set Content-Type manually — axios sets it with boundary for FormData
            },
         });

         if (res.data.success) {
            message.success('✅ Property listed successfully!');
            resetForm();
         } else {
            message.error(res.data.message || 'Failed to add property');
         }
      } catch (error) {
         console.error('Error adding property:', error);
         message.error(error.response?.data?.message || 'Server error. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <Container style={{ border: '1px solid lightblue', borderRadius: '8px', padding: '30px', marginTop: '10px' }}>
         <h5 className="mb-4">List a New Property</h5>
         <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
               <Form.Group as={Col} md="4">
                  <Form.Label>Property Type</Form.Label>
                  <Form.Select name="propertyType" value={propertyDetails.propertyType} onChange={handleChange}>
                     <option value="residential">Residential</option>
                     <option value="commercial">Commercial</option>
                     <option value="land/plot">Land / Plot</option>
                  </Form.Select>
               </Form.Group>

               <Form.Group as={Col} md="4">
                  <Form.Label>Listing Type</Form.Label>
                  <Form.Select name="propertyAdType" value={propertyDetails.propertyAdType} onChange={handleChange}>
                     <option value="rent">Rent</option>
                     <option value="sale">Sale</option>
                  </Form.Select>
               </Form.Group>

               <Form.Group as={Col} md="4">
                  <Form.Label>Full Address <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                     <Form.Control
                        type="text"
                        placeholder="e.g. Flat 3B, MG Road, Hyderabad"
                        name="propertyAddress"
                        value={propertyDetails.propertyAddress}
                        onChange={handleChange}
                        required
                     />
                  </InputGroup>
               </Form.Group>
            </Row>

            <Row className="mb-3">
               <Form.Group as={Col} md="6">
                  <Form.Label>Property Images <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                     type="file"
                     accept="image/*"
                     multiple
                     ref={fileInputRef}
                     onChange={handleImageChange}
                     required
                  />
                  <Form.Text className="text-muted">You can upload multiple images.</Form.Text>
               </Form.Group>

               <Form.Group as={Col} md="3">
                  <Form.Label>Owner Contact No. <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                     type="tel"
                     placeholder="10-digit mobile number"
                     name="ownerContact"
                     value={propertyDetails.ownerContact}
                     onChange={handleChange}
                     required
                  />
               </Form.Group>

               <Form.Group as={Col} md="3">
                  <Form.Label>Rent / Price (₹)</Form.Label>
                  <Form.Control
                     type="number"
                     placeholder="e.g. 15000"
                     name="propertyAmt"
                     value={propertyDetails.propertyAmt}
                     onChange={handleChange}
                     min="0"
                  />
               </Form.Group>
            </Row>

            <Row className="mb-3">
               <Col>
                  <FloatingLabel label="Additional Details (optional)">
                     <Form.Control
                        as="textarea"
                        style={{ height: '100px' }}
                        placeholder="Describe the property..."
                        name="additionalInfo"
                        value={propertyDetails.additionalInfo}
                        onChange={handleChange}
                     />
                  </FloatingLabel>
               </Col>
            </Row>

            <div className="d-flex gap-2">
               <Button variant="outline-info" type="submit" disabled={loading}>
                  {loading ? <><Spinner as="span" size="sm" animation="border" className="me-2" />Uploading...</> : 'Submit Property'}
               </Button>
               <Button variant="outline-secondary" type="button" onClick={resetForm} disabled={loading}>
                  Clear Form
               </Button>
            </div>
         </Form>
      </Container>
   );
}

export default AddProperty;