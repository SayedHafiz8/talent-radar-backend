import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Talent Radar API",
      version: "1.0.0",
      description: "Professional API Docs for Talent Radar",
    },

    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      // 🔥 Schemas
      schemas: {
        // ================= USER =================
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "coach"],
            },
            active: { type: "boolean" },
          },
        },

        // ================= PLAYER =================
        Player: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            age: { type: "number" },
            position: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected"],
            },
            coach: { type: "string" },
          },
        },

        // ================= REPORT =================
        Report: {
          type: "object",
          properties: {
            _id: { type: "string" },
            player: { type: "string" },
            coach: { type: "string" },
            rating: { type: "number" },
            notes: { type: "string" },
          },
        },

        // ================= MEDIA =================
        Media: {
          type: "object",
          properties: {
            _id: { type: "string" },
            player: { type: "string" },
            url: { type: "string" },
            type: { type: "string" },
          },
        },

        // ================= PAGINATION =================
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "number" },
            limit: { type: "number" },
            numberOfPages: { type: "number" },
          },
        },

        // ================= SUCCESS RESPONSE =================
        SuccessResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            count: {
              type: "number",
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
            data: {
              type: "object",
            },
          },
        },

        // ================= ERROR =================
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "error",
            },
            message: {
              type: "string",
            },
          },
        },
      },

      // 🔥 Reusable Responses
      responses: {
        UnauthorizedError: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },

        ValidationError: {
          description: "Validation Error",
        },
      },
    },

    // 🔐 Global Auth
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/*.js", "./routes/**/*.js"],
};

const specs = swaggerJsDoc(options);

export default specs;