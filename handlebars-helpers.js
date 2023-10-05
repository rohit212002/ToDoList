const Handlebars = require('handlebars');

// Custom Handlebars helper to safely access properties
Handlebars.registerHelper('getProperty', function (obj, property) {
    return obj[property];
});

module.exports = Handlebars;
