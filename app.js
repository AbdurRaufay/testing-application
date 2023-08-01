const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require("./server/gqlSchema");
const { resolvers } = require("./server/resolvers");
const User=require("./server/userModel")
// const verifyToken = require("./server/VerifyToken");
const jwt = require("jsonwebtoken");
const cors=require("cors")
const PORT = process.env.PORT || 8080;
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
require("dotenv/config");
const app=express()
app.use(express.json());

app.use(express.json());
app.use(cors())
// Initialize Passport
require('./server/passport');


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
//   res.redirect('/profile');
// });
app.get('/auth/google/callback', (req, res, next) => {
  // Handle CORS headers here before redirecting
  res.header('Access-Control-Allow-Origin', 'https://dreamy-madeleine-9acb7f.netlify.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  // Continue with the rest of the code
  passport.authenticate('google', { failureRedirect: '/' })(req, res, next);
});
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'abdurrauf', 
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.userId);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );


(async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
      const server = new ApolloServer({
        typeDefs,
        resolvers,     
        cors: {
          // origin :"http://localhost:3000",
            origin: 'https://dreamy-madeleine-9acb7f.netlify.app',
            credentials: true,
            methods: ['GET', 'POST'],
          },
        context: ({ req }) => {
          const token = req.headers.authorization || "";
          try {
            if (token) {
              const decoded = jwt.verify(token, "abdurrauf");
              const userId = decoded.userId;
              return { userId };
            } else {
              return { userId: null };
            }
          } catch (error) {
            return { userId: null };
          }
        },
        
        introspection: true,
        playground: true,
      });
      app.use(express.json())
      await server.start();
      server.applyMiddleware({ app, path: "/graphql" });
  
      app.listen(PORT, () => {
        
      console.log(`${"https://dark-zipper-deer.cyclic.cloud/graphql"}`)
          //  console.log(`http://localhost:${PORT}/graphql`)
      });
    } catch (error) {
      console.log("Error connecting to MongoDB:", error);
    }
  })();
  
  
  