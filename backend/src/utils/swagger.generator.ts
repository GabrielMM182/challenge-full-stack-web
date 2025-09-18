const swaggerAutogen = require('swagger-autogen')();
import path from 'path';
import { swaggerConfig } from '../config/swagger.config';

const outputFile = path.join(__dirname, '../../swagger.json');
const endpointsFiles = [
  path.join(__dirname, '../routes/index.ts'),
  path.join(__dirname, '../routes/auth.routes.ts'),
  path.join(__dirname, '../routes/student.routes.ts')
];

/**
 * Generate Swagger documentation
 * This function uses swagger-autogen to scan route files and generate OpenAPI 3.0 documentation
 */
export const generateSwaggerDocs = async (): Promise<void> => {
  try {
    console.log('Generating Swagger documentation...');
    
    await swaggerAutogen(outputFile, endpointsFiles, swaggerConfig);
    
    console.log('Swagger documentation generated successfully at:', outputFile);
  } catch (error) {
    console.error('Error generating Swagger documentation:', error);
    throw error;
  }
};

/**
 * Generate Swagger documentation and exit
 * This function is used for standalone generation (e.g., in npm scripts)
 */
export const generateAndExit = async (): Promise<void> => {
  try {
    await generateSwaggerDocs();
    process.exit(0);
  } catch (error) {
    console.error('Failed to generate Swagger documentation:', error);
    process.exit(1);
  }
};

// If this file is run directly, generate the documentation
if (require.main === module) {
  generateAndExit();
}