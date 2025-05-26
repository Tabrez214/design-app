# T-Shirt Design App Backend

This is the backend API for the T-Shirt Design App, providing endpoints for design management, asset management, quoting, and order processing.

## Features

- Design creation, retrieval, and updating
- Public and private design sharing
- Image and clipart asset management
- Quote calculation and checkout process
- Printer challan generation with design dimensions
- Email notifications with design previews

## Project Structure

```
tshirt-design-backend/
├── src/
│   ├── config/
│   │   └── config.js         # Configuration variables
│   ├── controllers/          # Controller logic (optional)
│   ├── middleware/           # Custom middleware
│   ├── models/
│   │   ├── assetModel.js     # Asset schema
│   │   ├── designModel.js    # Design schema
│   │   ├── orderModel.js     # Order schema
│   │   └── tshirtStyleModel.js # T-shirt style schema
│   ├── routes/
│   │   ├── assetRoutes.js    # Asset management routes
│   │   ├── designRoutes.js   # Design management routes
│   │   └── quoteRoutes.js    # Quote and checkout routes
│   ├── utils/
│   │   ├── designUtils.js    # Design-related utilities
│   │   ├── emailUtils.js     # Email sending utilities
│   │   └── imageUtils.js     # Image processing utilities
│   └── server.js             # Main server file
├── uploads/                  # File storage directory
│   ├── designs/
│   │   ├── previews/         # Design preview images
│   │   └── challans/         # Printer challans
│   ├── clipart/              # Clipart assets
│   └── user-uploads/         # User-uploaded images
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── package.json              # Project dependencies
├── README.md                 # Project documentation
└── TESTING.md                # Testing guide
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/tshirt-design-backend.git
   cd tshirt-design-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tshirt-design-app
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://styledev.in
   
   # Email configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=user@example.com
   SMTP_PASS=password
   EMAIL_FROM=designs@styledev.in
   ```

4. Create the uploads directory structure:
   ```
   mkdir -p uploads/{designs/previews,designs/challans,clipart,user-uploads}
   ```

5. Start the server:
   ```
   npm start
   ```

## API Documentation

### Design Management API

#### Create a Design

- **URL**: `/api/designs`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "design": {
      "name": "My Design",
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
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "designId": "abc123",
    "shareableLink": "https://styledev.in/design/abc123?token=xyz",
    "publicLink": null,
    "message": "Design saved successfully"
  }
  ```

#### Get a Design

- **URL**: `/api/designs/:id`
- **Method**: `GET`
- **Query Parameters**: `token` (required for private designs)
- **Response**:
  ```json
  {
    "success": true,
    "design": {
      "id": "abc123",
      "name": "My Design",
      "tshirt": { "style": "gildan", "color": "#FF0000" },
      "elements": [...],
      "currentView": "front",
      "previewImages": {
        "front": "/uploads/designs/previews/design-abc123-front.jpg",
        "back": "/uploads/designs/previews/design-abc123-back.jpg",
        "left": "/uploads/designs/previews/design-abc123-left.jpg",
        "right": "/uploads/designs/previews/design-abc123-right.jpg"
      },
      "isPublic": false
    }
  }
  ```

#### Update a Design

- **URL**: `/api/designs/:id`
- **Method**: `PUT`
- **Query Parameters**: `token` (required)
- **Request Body**: Updated design data
- **Response**:
  ```json
  {
    "success": true,
    "message": "Design updated successfully",
    "design": {
      "id": "abc123",
      "name": "Updated Design",
      "tshirt": { "style": "gildan", "color": "#00FF00" },
      "elements": [...],
      "previewImages": {...},
      "isPublic": false
    }
  }
  ```

#### Send Design Email

- **URL**: `/api/designs/:id/email`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "recipient@example.com",
    "message": "Check out this design!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Design email sent successfully"
  }
  ```

### Asset Management API

#### Upload an Image

- **URL**: `/api/assets/images`
- **Method**: `POST`
- **Request**: Multipart form data with `image` file
- **Response**:
  ```json
  {
    "success": true,
    "url": "/uploads/user-uploads/user-image-abc123.jpg",
    "thumbnailUrl": "/uploads/user-uploads/user-image-abc123.jpg",
    "assetId": "5f8d43e1c7b2d34b3c8d4567",
    "message": "Image uploaded successfully"
  }
  ```

#### Get Clipart Categories

- **URL**: `/api/assets/clipart/categories`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "categories": ["animals", "sports", "nature"]
  }
  ```

#### Get Clipart by Category

- **URL**: `/api/assets/clipart/category/:categoryId`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "success": true,
    "category": "animals",
    "clipart": [
      {
        "url": "/uploads/clipart/animals/clipart-image-abc123.png",
        "thumbnailUrl": "/uploads/clipart/animals/clipart-image-abc123.png",
        "dimensions": { "width": 200, "height": 200 },
        "tags": ["dog", "pet"]
      }
    ]
  }
  ```

#### Search Clipart

- **URL**: `/api/assets/clipart/search`
- **Method**: `GET`
- **Query Parameters**: `query`
- **Response**:
  ```json
  {
    "success": true,
    "query": "dog",
    "results": [
      {
        "url": "/uploads/clipart/animals/clipart-image-abc123.png",
        "thumbnailUrl": "/uploads/clipart/animals/clipart-image-abc123.png",
        "dimensions": { "width": 200, "height": 200 },
        "tags": ["dog", "pet"],
        "category": "animals"
      }
    ]
  }
  ```

### Quote and Checkout API

#### Calculate Quote

- **URL**: `/api/quote`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "designId": "abc123",
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
- **Response**:
  ```json
  {
    "success": true,
    "quote": {
      "designId": "abc123",
      "totalQuantity": 35,
      "sizes": {
        "S": 5,
        "M": 10,
        "L": 15,
        "XL": 5
      },
      "priceBreakdown": {
        "basePrice": 8750,
        "additionalCosts": [
          {
            "description": "Text printing",
            "amount": 100
          },
          {
            "description": "Image printing",
            "amount": 100
          }
        ],
        "subtotal": 8950,
        "tax": 1611,
        "shipping": 100,
        "total": 10661
      }
    }
  }
  ```

#### Generate Printer Challan

- **URL**: `/api/printer-challan`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "designId": "abc123",
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
- **Response**:
  ```json
  {
    "success": true,
    "challanUrl": "/uploads/designs/challans/challan-order-ORD12345.pdf",
    "message": "Printer challan generated successfully"
  }
  ```

#### Initiate Checkout

- **URL**: `/api/checkout`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "designId": "abc123",
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
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "orderNumber": "ORD-123456-789",
      "total": 10661,
      "paymentUrl": "/payment/ORD-123456-789",
      "challanUrl": "/uploads/designs/challans/challan-order-ORD-123456-789.pdf"
    },
    "message": "Order created successfully"
  }
  ```

## Development

### Scripts

- `npm start`: Start the server
- `npm run dev`: Start the server with nodemon for development
- `npm test`: Run tests

### Adding New T-Shirt Styles

To add a new t-shirt style, create a script to insert it into the database:

```javascript
const mongoose = require('mongoose');
const TShirtStyle = require('./src/models/tshirtStyleModel');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  const newStyle = new TShirtStyle({
    name: 'gildan',
    description: 'Gildan Cotton T-Shirt',
    basePrice: 250,
    availableColors: [
      { name: 'White', hex: '#FFFFFF', isAvailable: true },
      { name: 'Black', hex: '#000000', isAvailable: true },
      { name: 'Red', hex: '#FF0000', isAvailable: true },
      // Add more colors
    ],
    availableSizes: [
      { size: 'S', isAvailable: true, additionalCost: 0 },
      { size: 'M', isAvailable: true, additionalCost: 0 },
      { size: 'L', isAvailable: true, additionalCost: 0 },
      { size: 'XL', isAvailable: true, additionalCost: 0 },
      { size: '2XL', isAvailable: true, additionalCost: 50 },
      { size: '3XL', isAvailable: true, additionalCost: 50 },
      { size: '4XL', isAvailable: true, additionalCost: 100 },
      { size: '5XL', isAvailable: true, additionalCost: 100 },
    ],
    images: {
      front: '/images/tshirt-front.jpg',
      back: '/images/tshirt-back.jpg',
      left: '/images/tshirt-left.jpg',
      right: '/images/tshirt-right.jpg'
    },
    printableAreas: {
      front: { width: 300, height: 400, x: 250, y: 200 },
      back: { width: 300, height: 400, x: 250, y: 200 },
      left: { width: 100, height: 100, x: 100, y: 300 },
      right: { width: 100, height: 100, x: 600, y: 300 }
    },
    isActive: true
  });

  await newStyle.save();
  console.log('T-shirt style added successfully');
  mongoose.connection.close();
})
.catch(error => {
  console.error('Error:', error);
  mongoose.connection.close();
});
```

## Deployment

### VPS Deployment

1. Clone the repository on your VPS
2. Install dependencies: `npm install --production`
3. Set up environment variables in `.env` file
4. Create the uploads directory structure
5. Set up a process manager like PM2: `pm2 start src/server.js --name tshirt-design-api`
6. Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.styledev.in;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /path/to/tshirt-design-backend/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

7. Set up SSL with Let's Encrypt
8. Restart Nginx: `sudo systemctl restart nginx`

### Docker Deployment

1. Create a Dockerfile:

```dockerfile
FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

VOLUME ["/app/uploads"]

EXPOSE 5000

CMD ["node", "src/server.js"]
```

2. Build and run the Docker container:

```
docker build -t tshirt-design-api .
docker run -p 5000:5000 -v /path/to/uploads:/app/uploads --env-file .env tshirt-design-api
```

## Testing

See [TESTING.md](TESTING.md) for detailed testing instructions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
