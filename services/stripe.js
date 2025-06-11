const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RWjoj4e62nl5o987Y4pTcFqXQgbOCd9Lg8rJOlrsI5ccS7M39z2J6tqZ1kZoL23GQfupQRo3Lp9cIe5j3eobHIh001iGEmUmF');

module.exports = stripe;