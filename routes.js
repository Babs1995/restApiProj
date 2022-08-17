'use strict';
const express = require('express');
const auth = require('basic-auth');
const { authUser } = require('./middleware/auth-user');
const { User, Courses } = require('./models');
const { asyncHandler } = require('./middleware/asyncHandler');
const router = express.Router();

function asyncHandler(cb){
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  }

