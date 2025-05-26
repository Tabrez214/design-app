# T-Shirt Design App API Testing Guide

This document outlines the testing procedures for the T-Shirt Design App backend API. It covers all endpoints, expected behaviors, and common edge cases to verify.

## Prerequisites

1. MongoDB running locally or connection to a remote MongoDB instance
2. Node.js environment set up
3. Environment variables configured in `.env` file

## Environment Setup for Testing

Create a `.env` file in the project root with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tshirt-design-app-test
JWT_SECRET=test-secret-key
FRONTEND_URL=http://localhost:3000
```

## Testing Workflow

### 1. Design Management API Tests

#### 1.1 Save Design (POST /api/designs)

**Test Case 1: Successful Design Creation**
- Request:
  ```json
  {
    "design": {
      "name": "Test Design",
      "tshirt": {
        "style": "gildan",
        "color": "#FF0000"
      },
      "elements": [
        {
          "id": "elem1",
          "type": "text",
          "position": { "x": 100, "y": 100 },
          "size": { "width": 200, "height": 50 },
          "rotation": 0,
          "layer": 1,
          "view": "front",
          "properties": {
            "text": "Hello World",
            "fontFamily": "Arial",
            "fontSize": 24,
            "fontColor": "#000000"
          }
        }
      ],
      "isPublic": false
    },
    "email": "test@example.com"
  }
  ```
- Expected Response:
  - Status: 201
  - Contains: `designId`, `shareableLink`, `message`

**Test Case 2: Missing Required Fields**
- Request: Omit `design` or `email`
- Expected Response:
  - Status: 400
  - Error message about required fields

**Test Case 3: Public Design Creation**
- Request: Same as Test Case 1 but with `isPublic: true`
- Expected Response:
  - Status: 201
  - Contains: `designId`, `shareableLink`, `publicLink`

#### 1.2 Get Design by ID (GET /api/designs/:id)

**Test Case 1: Retrieve Private Design with Valid Token**
- Create a design first
- Request: GET with the design ID and token
- Expected Response:
  - Status: 200
  - Contains design details

**Test Case 2: Retrieve Private Design without Token**
- Request: GET with only the design ID
- Expected Response:
  - Status: 401
  - Error message about authentication

**Test Case 3: Retrieve Public Design without Token**
- Create a public design first
- Request: GET with the design ID
- Expected Response:
  - Status: 200
  - Contains design details

**Test Case 4: Invalid Design ID**
- Request: GET with a non-existent ID
- Expected Response:
  - Status: 404
  - Error message about design not found

#### 1.3 Update Design (PUT /api/designs/:id)

**Test Case 1: Successful Design Update**
- Create a design first
- Request: PUT with valid token and updated design data
- Expected Response:
  - Status: 200
  - Contains updated design details

**Test Case 2: Update without Token**
- Request: PUT without token
- Expected Response:
  - Status: 401
  - Error message about authentication

**Test Case 3: Update with Invalid Token**
- Request: PUT with invalid token
- Expected Response:
  - Status: 401
  - Error message about invalid token

#### 1.4 Send Design Email (POST /api/designs/:id/email)

**Test Case 1: Successful Email Sending**
- Create a design first
- Request:
  ```json
  {
    "email": "recipient@example.com",
    "message": "Check out this design!"
  }
  ```
- Expected Response:
  - Status: 200
  - Success message

**Test Case 2: Missing Email**
- Request: Omit `email`
- Expected Response:
  - Status: 400
  - Error message about required email

### 2. Asset Management API Tests

#### 2.1 Upload Image (POST /api/assets/images)

**Test Case 1: Successful Image Upload**
- Request: Multipart form with image file
- Expected Response:
  - Status: 201
  - Contains: `url`, `thumbnailUrl`, `assetId`

**Test Case 2: Invalid File Type**
- Request: Multipart form with non-image file
- Expected Response:
  - Status: 400
  - Error message about file type

**Test Case 3: File Too Large**
- Request: Multipart form with image file > 5MB
- Expected Response:
  - Status: 400
  - Error message about file size

#### 2.2 Get Clipart Categories (GET /api/assets/clipart/categories)

**Test Case 1: Retrieve Categories**
- Seed database with clipart assets first
- Request: GET
- Expected Response:
  - Status: 200
  - List of categories

#### 2.3 Get Clipart by Category (GET /api/assets/clipart/category/:categoryId)

**Test Case 1: Retrieve Clipart in Category**
- Seed database with clipart assets first
- Request: GET with valid category
- Expected Response:
  - Status: 200
  - List of clipart in category

**Test Case 2: Empty Category**
- Request: GET with category that has no clipart
- Expected Response:
  - Status: 200
  - Empty clipart array

#### 2.4 Search Clipart (GET /api/assets/clipart/search)

**Test Case 1: Search with Query**
- Seed database with clipart assets first
- Request: GET with `query` parameter
- Expected Response:
  - Status: 200
  - Search results

**Test Case 2: Search without Query**
- Request: GET without `query` parameter
- Expected Response:
  - Status: 400
  - Error message about required query

### 3. Quote and Checkout API Tests

#### 3.1 Calculate Quote (POST /api/quote)

**Test Case 1: Successful Quote Calculation**
- Create a design first
- Request:
  ```json
  {
    "designId": "design-id",
    "sizes": {
      "S": 5,
      "M": 10,
      "L": 15,
      "XL": 5
    },
    "options": {
      "hasText": true,
      "hasImage": true,
      "hasBackDesign": false
    }
  }
  ```
- Expected Response:
  - Status: 200
  - Contains: `quote` with price breakdown

**Test Case 2: Missing Required Fields**
- Request: Omit `designId` or `sizes`
- Expected Response:
  - Status: 400
  - Error message about required fields

**Test Case 3: Zero Quantity**
- Request: All sizes with quantity 0
- Expected Response:
  - Status: 400
  - Error message about total quantity

#### 3.2 Generate Printer Challan (POST /api/printer-challan)

**Test Case 1: Successful Challan Generation**
- Create a design first
- Request:
  ```json
  {
    "designId": "design-id",
    "orderDetails": {
      "orderNumber": "ORD12345",
      "sizes": {
        "S": 5,
        "M": 10,
        "L": 15,
        "XL": 5
      }
    }
  }
  ```
- Expected Response:
  - Status: 200
  - Contains: `challanUrl`

**Test Case 2: Missing Required Fields**
- Request: Omit `designId` or `orderDetails`
- Expected Response:
  - Status: 400
  - Error message about required fields

#### 3.3 Initiate Checkout (POST /api/checkout)

**Test Case 1: Successful Checkout**
- Create a design first
- Request:
  ```json
  {
    "designId": "design-id",
    "sizes": {
      "S": 5,
      "M": 10,
      "L": 15,
      "XL": 5
    },
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe",
      "address": "123 Main St, City, Country",
      "phone": "1234567890"
    },
    "shippingMethod": "standard"
  }
  ```
- Expected Response:
  - Status: 201
  - Contains: `order` with `orderNumber`, `total`, `paymentUrl`, `challanUrl`

**Test Case 2: Missing Required Fields**
- Request: Omit `designId`, `sizes`, or `customer`
- Expected Response:
  - Status: 400
  - Error message about required fields

**Test Case 3: Rush Shipping**
- Request: Same as Test Case 1 but with `shippingMethod: "rush"`
- Expected Response:
  - Status: 201
  - Higher shipping cost in price breakdown

## Integration Testing

### 1. End-to-End Design Workflow

1. Upload an image asset
2. Create a design with the uploaded image
3. Update the design to add text
4. Generate a quote for the design
5. Create an order for the design
6. Generate a printer challan for the order
7. Send the design via email

### 2. File Storage Testing

1. Verify that uploaded images are saved to the correct directory
2. Verify that design preview images are generated and saved
3. Verify that printer challans are generated and saved
4. Verify that all files are accessible via their URLs

### 3. Email Testing

1. Verify that design emails are sent with correct content
2. Verify that preview images are attached to emails
3. Verify that design links in emails work correctly

## Performance Testing

1. Test API response times with large designs (many elements)
2. Test concurrent requests to the API
3. Test file upload performance with large images

## Security Testing

1. Verify that private designs cannot be accessed without valid tokens
2. Verify that JWT tokens expire correctly
3. Verify that file uploads are properly validated and sanitized
4. Verify that API endpoints are protected against common attacks (injection, XSS, etc.)

## Error Handling Testing

1. Test database connection failures
2. Test file system access failures
3. Test email sending failures
4. Verify that all errors are properly logged and reported

## Automated Testing Setup

For automated testing, you can use Jest and Supertest:

```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

describe('Design API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  test('Should create a new design', async () => {
    const response = await request(app)
      .post('/api/designs')
      .send({
        design: {
          name: 'Test Design',
          tshirt: {
            style: 'gildan',
            color: '#FF0000'
          },
          elements: [
            {
              id: 'elem1',
              type: 'text',
              position: { x: 100, y: 100 },
              size: { width: 200, height: 50 },
              rotation: 0,
              layer: 1,
              view: 'front',
              properties: {
                text: 'Hello World',
                fontFamily: 'Arial',
                fontSize: 24,
                fontColor: '#000000'
              }
            }
          ],
          isPublic: false
        },
        email: 'test@example.com'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('designId');
    expect(response.body).toHaveProperty('shareableLink');
  });

  // Add more tests for other endpoints
});
```

## Manual Testing Checklist

- [ ] All API endpoints return expected responses
- [ ] File uploads work correctly
- [ ] Preview images are generated correctly
- [ ] Printer challans are generated correctly
- [ ] Emails are sent correctly
- [ ] Error handling works as expected
- [ ] Authentication and authorization work correctly
- [ ] Performance is acceptable under load
- [ ] Security measures are effective

## Troubleshooting Common Issues

1. **MongoDB Connection Errors**
   - Verify MongoDB is running
   - Check connection string in `.env` file
   - Ensure network connectivity to MongoDB server

2. **File Upload Issues**
   - Check file permissions on upload directories
   - Verify multer configuration
   - Check file size limits

3. **Email Sending Failures**
   - Verify SMTP configuration
   - Check email templates
   - Test with different email providers

4. **JWT Authentication Issues**
   - Verify JWT secret key
   - Check token expiration settings
   - Ensure tokens are being passed correctly in requests

5. **PDF Generation Issues**
   - Check PDFKit configuration
   - Verify file paths for images
   - Ensure write permissions for output directories
