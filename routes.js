'use strict';

const express = require('express');
const auth = require('basic-auth');
const { authUser } = require('./middleware/auth-user');
const { asyncHandler } = require('./middleware/asyncHandler');
const { User, Courses } = require('./models');
const router = express.Router();

router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const userInfo = user.dataValues;
    const userInfoShared = Object.keys(userInfo)
      .slice(1, 4)
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: user[key],
        });
      }, {});

    res.json(userInfoShared).status(200);
  })
);

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    let user;
    try {
      user = await User.create(req.body);
      const errors = [];
      if (!user.firstName) {
        errors.push("Please provide a value for firstName");
      }
      if (!user.lastName) {
        errors.push("Please provide a value for lastName");
      }
      if (!user.email) {
        errors.push("Please provide a value for email");
      }
      if (!user.password) {
        errors.push("Please provide a value for password");
      }
      res.location("/").status(201).end();
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
      const courseInfo = course.dataValues;
      const neededInfo = Object.entries(courseInfo);
      neededInfo.splice(5, 3);
      const displayCourseInfo = Object.fromEntries(neededInfo);
      res.json(displayCourseInfo).status(200);
    } else {
      res.status(404);
    }
  })
);

router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    let course;
    try {
      course = await Courses.create(req.body);
      let errors = [];
      if (!course.title) {
        errors.push("Please provide a value for title");
      }
      if (!course.description) {
        errors.push("Please provide a value for description");
      }
      res.location(`/courses/${course.id}`).status(201).end();
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

router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    let course;
    try {
      course = await Courses.findByPk(req.params.id);
      if (user.id === course.dataValues.userId) {
        if (course) {
          await course.update(req.body);
          res.status(204).end();
        } else {
          res.status(404);
        }
      } else {
        res.status(403).end();
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

router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    const course = await Courses.findByPk(req.params.id);
    if (user.id === course.dataValues.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).end();
    }
  })
);

module.exports = router;