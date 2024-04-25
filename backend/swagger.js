const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Test Nutech',
    description: 'Test Nutech'
  },
  host: 'localhost:3000',
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];


swaggerAutogen(outputFile, routes, doc).then(() => {
    require('./app.js')
})