import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MacZone E-Commerce API",
      version: "1.0.0",
      description: `
        MacZone E-Commerce API Documentation
        
        ## Features
        - 🔐 Authentication (Register, Login, Forgot Password)
        - 👤 User Management
        - 🛍️ Product & Category Management
        - 🛒 Shopping Cart
        - 📦 Orders
        - ⭐ Reviews
        - 💬 Chat Support
        - 🤖 AI Product Recommendations
        
        ## Authentication
        Most endpoints require JWT token. Get token from login/register endpoint.
        Use Bearer token in Authorization header.
      `,
      contact: {
        name: "MacZone Support",
        email: "support@maczone.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://api.maczone.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token from login/register response",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            full_name: {
              type: "string",
              example: "Nguyễn Văn A",
            },
            phone: {
              type: "string",
              example: "0123456789",
            },
            address: {
              type: "string",
              example: "123 ABC Street, District 1, Ho Chi Minh City",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  msg: { type: "string" },
                  param: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Not authorized to access this route",
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: "User does not have permission",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example:
                      "User role 'user' is not authorized to access this route",
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Resource not found" },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description:
          "User authentication endpoints (register, login, forgot password)",
      },
      {
        name: "Users",
        description: "User management endpoints (admin only)",
      },
      {
        name: "Products",
        description: "Product management endpoints",
      },
      {
        name: "Categories",
        description: "Category management endpoints",
      },
      {
        name: "Cart",
        description: "Shopping cart endpoints",
      },
      {
        name: "Orders",
        description: "Order management endpoints",
      },
      {
        name: "Reviews",
        description: "Product review endpoints",
      },
      {
        name: "Chat",
        description: "Customer support chat endpoints",
      },
      {
        name: "AI",
        description: "AI product recommendation endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
