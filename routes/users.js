var express = require('express');
var router = express.Router();
var User = require("../models/User");
var Mock = require("../models/Mock");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');

const mockSamples = (user) => {
  const demo = [
    {
      name: "Sample Request Validation",
      user_id: user.id,
      method: "POST",
      route: "demo-1",
      response_code: "200",
      request: `{
        "name": "required",
        "username": "required|min:3|max:14",
        "number": "required|between:3,8"
      }`,
      response: `{
        "status": true
      }`,
      date: new Date(),
      status: "active",
      count: 0
    },
    {
      name: "Sample Faker Response",
      user_id: user.id,
      method: "GET",
      route: "demo-2",
      response_code: "200",
      request: "",
      response: `{
      "status": true,
      "users--total-5--": [
        {
          "firstname": "{{name.firstName}}",
          "lastname": "{{name.lastName}}",
          "avatar": "{{image.avatar}}"
        }
      ]
    }`,
      date: new Date(),
      status: "active",
      count: 0
    }
  ]

  return demo;
}

/* User Login */
router.post('/login', function(req, res, next) {
  const token     = req.body.token;
  // const email     = req.body.email;
  // const password  = req.body.password;

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { email, password } = decodedToken;

  User.findOne({email: email}).then(data => {
    if(bcrypt.compareSync(password, data.password)) {
      const token = jwt.sign({
        id: data._id,
        name: data.name,
        username: data.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn :"7d"
      })

      const result = {
        token: token
      }

      res.json(result)
    } else {
      res.status(400);
      res.json({
        status: false,
        message: "Wrong password."
      })
    }
  }).catch(err => {
    res.status(400);
    res.json(err)
  })
});


/* User Create */
router.post('/create', async function(req, res, next) {
  const token     = req.body.token;

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const { name, email, password, username } = decodedToken;
  const isExists = false;

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  new User({
    name: name,
    username: username,
    email: email,
    password: hash,
    date: new Date(),
    type: 'user',
    locale: 'en'
  }).save().then((response) => {
    Mock.insertMany(mockSamples(response)).then(() => {
      res.json({
        status: true,
        message: "User has been registered. Please log in."
      });
    }).catch((err) => {
      res.status(400);
      res.json({
        status: false,
        message: err
      });
    })
  }).catch((err) => {
    res.status(400);
    res.json({
      status: false,
      message: err
    });
  });

});

router.get('/profile', checkAuth, function(req, res, next) {
  const id = req.userData.id;

  User.findById(id).then((data) => {
    res.json({
      name: data.name,
      username: data.username,
      email: data.email,
      password: '',
      locale: data.locale
    })
  }).catch((err) => {
    res.status(400)
    res.json({
      status: false,
      message: err
    })
  })
})

router.put('/profile', checkAuth, function(req, res, next) {
  const id = req.userData.id;

  const { name, email, password, username, locale } = req.body;
  const isExists = false;

  if(!name || !email || !username) {
    res.status(400);
    res.json({
      status: false,
      message: "Missing information."
    })
    return;
  }

  const userData = {
    name: name,
    username: username,
    email: email,
    locale: locale
  }

  if(password) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    userData.password = hash;
  }

  User.findOneAndUpdate(userData).then((response) => {
    res.json({
      status: true,
      message: "User settings has been updated.",
      data: {
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: '',
        locale: userData.locale
      }
    });
  }).catch((err) => {
    res.status(400);
    res.json({
      status: false,
      message: err
    });
  });
})

module.exports = router;
