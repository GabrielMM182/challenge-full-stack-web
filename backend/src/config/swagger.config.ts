export const swaggerConfig = {
  openapi: '3.0.0',
  "info": {
    "title": "Student Management API",
    "version": "1.0.0",
    "description": "+A Educação - Full Stack Web Developer challenge"
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Students',
      description: 'Student management operations'
    },
    {
      name: 'Health',
      description: 'System health and monitoring endpoints'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful'
          },
          data: {
            type: 'object',
            description: 'Response data (present on successful requests)'
          },
          error: {
            $ref: '#/components/schemas/ErrorResponse'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO timestamp of the response'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Error code identifier'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            },
            description: 'Detailed validation errors (if applicable)'
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                description: 'Current page number'
              },
              limit: {
                type: 'integer',
                description: 'Number of items per page'
              },
              total: {
                type: 'integer',
                description: 'Total number of items'
              },
              totalPages: {
                type: 'integer',
                description: 'Total number of pages'
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

export const swaggerOptions = {
  definition: swaggerConfig,
  apis: ['./src/routes/*.ts'],
};