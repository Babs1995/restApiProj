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
  router.get('/users', authUser ,asyncHandler(async (req, res) => {
    const user = req.currentUser; 
    res.status(200).json({ 
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddress,
     });
  }));
  router.post(
    "/users",
    asyncHandler(async (req, res) => {
      try {
        await Users.create(req.body);
        res.location("/");
        res.status(201).end();
      } catch (error) {
        if (
            error.name === "SequelizeValidationError" ||
            error.name === "SequelizeUniqueConstraintError"
          ) {
            const errors = error.errors.map((err) => err.message);
            res.status(400).json({ errors });
          } else {
            throw error;
          }
        }
      })
    );
    router.get(
        "/courses",
        asyncHandler(async (req, res) => {
          const courses = await Courses.findAll({
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'userId']
            },
            include:[{
              model: User,
              attributes: {
                exclude:['createdAt', 'updatedAt', 'password']
              }
            }]
          });
          console.log(courses.map((course) => course.get()));
          res.json(courses).status(200);
        })
      );
      router.get(
        "/courses/:id",
        asyncHandler(async (req, res) => {
          const course = await Courses.findByPk(req.params.id, {
            include:[{
              model: User,
              attributes: {
                exclude:['createdAt', 'updatedAt', 'password']
              }
            }]
          });
          if (course) {   
            res.json(displayCourseInfo).status(200);
        } else {
          res.status(404);
        }  
    })
    );
    router.put(
        "/courses/:id",
        authenticateUser,
        asyncHandler(async (req, res) => {
          const user = req.currentUser;
          let course;
          try {
            let courses = await Courses.findByPk(req.params.id);
            if (courses) {
              await courses.update(req.body);
              res.status(204).end();
            } else {
              res.status(404).json();
            } 
         } catch (error) {
                if (
                  error.name === "SequelizeValidationError" ||
                  error.name === "SequelizeUniqueConstraintError"
                ) {
                  const errors = error.errors.map((err) => err.message);
                  res.status(400).json({ errors });
                } else {
                  throw error;
                }
              }
            })
          );