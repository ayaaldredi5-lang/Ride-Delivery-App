const axios = require('axios');
// Geoapify Directions API key const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
/**
Get route and driving distance between two locations.
start and end format: [longitude, latitude] */ async function getRoute({ start, end }) { const url = https://api.geoapify.com/v1/routing?waypoints=${start[1]},${start[0]}|${end[1]},${end[0]}&mode=drive&apiKey=${GEOAPIFY_API_KEY};
try { const response = await axios.get(url); return response.data; } catch (error) { console.error('Geoapify routing error:', error.message); throw new Error('Unable to get route from Geoapify'); } }
/**
Calculate fare in Libyan Dinars.
@param {number} distance - Distance in meters
@returns {number} Fare in LYD */ function calculateFare(distance) { return (distance / 1000) * 1.5; }
module.exports = { getRoute, calculateFare };
