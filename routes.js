'use strict';
const express = require('express');
const auth = require('basic-auth');
const { authUser } = require('./middleware/auth-user');
const { User, Courses } = require('./models');
const { asyncHandler } = require('./middleware/asyncHandler');



