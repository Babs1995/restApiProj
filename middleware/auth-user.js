'use strict';

const { User } = require('../models');
const bcrypt = require('bcrypt')
const auth = require('basic-auth');

exports.authUser = async (req, res, next) => {
    let message;
    const credentials = auth(req);

    if (credentials) {
        const user = await User.findOne({ 
            where: { 
                emailAddress: credentials.name },
        });
    
        if (user) {
          const authenticated = bcrypt.compareSync(credentials.pass, user.password);
    
          if (authenticated) {
            console.log(`Authentication successful for user: ${user.emailAddress}`);
            req.currentUser = user;
          } else {
            message = `Authentication failure for user: ${user.emailAddress}`;
          }
        } else {
          message = `User not found for user: ${credentials.emailAddress}`;
        }
      } else {
        message = "Auth header not found";
      }
      if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
      } else {
        next();
      }
    };