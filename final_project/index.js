// Entry point for the Express sample app.
// Sets up JSON parsing, session handling, a JWT-based auth middleware for protected routes,
// and mounts routers implemented in `router/auth_users.js` and `router/general.js`.
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Session middleware for `/customer` routes. The sample uses sessions to store the JWT.
// Note: `secret` here is a tutorial string; in production use a secure secret and HTTPS.
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

// Authentication middleware for routes under `/customer/auth/*`.
// - Checks `req.session.authorization.accessToken` and verifies the JWT using the 'access' secret.
// - On success the decoded token is attached to `req.user` and `next()` is called.
// - Otherwise returns 403. This middleware protects routes mounted under `/customer/auth`.
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        // Get the authorization object stored in session
        token = req.session.authorization['accessToken'];
        // Verify the JWT token using the same literal 'access' secret used in `auth_users.js`
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" })
            }
        });
    } else {
        return res.status(403).json({ message: "User not Logged in" })
    }
});
 
const PORT = 5000;

// Mount routers
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
