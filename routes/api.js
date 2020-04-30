var express = require('express');
var router = express.Router();
var Mock = require("../models/Mock");
var User = require("../models/User");
var faker = require('faker');
var helpers = require('../helper/dataTypes.js')

var checkUser = (username) => {
  return new Promise((resolve, reject) => {
    User.findOne({username: username}).then(data => {
      resolve(data)
    }).catch(err => {
      reject(err)
    })
  });
};

const createFromFaker = (response, isJson = false, parameters = {}) => {
  const data = JSON.parse(response)

  Object.keys(data).forEach(function(key) {
    if (key.indexOf("--total-") > -1) {
      const keyParts = key.split("--total-")
      const dataCount = parseInt(keyParts[1].split("--")[0])

      const template = JSON.stringify(data[key][0])
      data[key] = []

      for(let i = 0; i < dataCount; i++) {
        data[key].push(createFromFaker(template, true, parameters))
      }

      data[keyParts[0]] = data[key]
      delete data[key]
    } else {
      if (typeof data[key] === 'object') {
        const template = JSON.stringify(data[key])
        data[key] = createFromFaker(template, true, parameters)
      } else {
        if (data[key].toString().indexOf("{{") > -1 && data[key].toString().indexOf("}}") > -1) {
          let fakerElement;

          if (data[key].indexOf("(") > -1 && data[key].indexOf(")") > -1) {
            const type = data[key].split(".")[0].split("{{")[1].trim()
            const method = data[key].split(".")[1].split("(")[0]
            const params = data[key].split(".")[1].split("(")[1].split(")")[0].split(",")

            for (var i = 0; i < params.length; i++) {
              params[i] = fakerType(params[i])
            }

            fakerElement = faker[type][method](...params)
          } else {
            fakerElement = faker.fake(data[key])
          }

          fakerElement = filterFaker(fakerElement)

          data[key] = fakerType(fakerElement)
        }

        if(data[key].toString().substring(0, 1) === "$") {
          const paramKey = data[key].substring(1, data[key].length)
          const paramVal = fakerType(parameters[paramKey]) || data[key]

          data[key] = paramVal
        }
      }
    }

  });

  return isJson ? data : JSON.stringify(data)
}

const filterFaker = (value) => {
  if(value.toString().indexOf("http://lorempixel.com") > -1) {
    value = value.replace("http://lorempixel.com", "https://loremflickr.com")
  }

  return value
}

const fakerType = (data) => {
  let type;
  if (!isNaN(data) && data.toString().indexOf('.') != -1) {
    type = "float"
  } else if (!isNaN(data) && !isNaN(parseInt(data))) {
    type = "integer"
  } else {
    type = "string"
  }

  if (type === "float") {
    const precision = data.toString().split(".")[1]

    return parseFloat(parseFloat(data).toFixed(precision.length))
  } else if (type === "integer") {
    return parseInt(data)
  } else {
    return data
  }
}

const returnData = (req, res, data, params) => {
  let errors = []

  if (typeof data.request !== "undefined" && data.request !== "") {
    const jsonRequest = JSON.parse(data.request)
    Object.keys(jsonRequest).forEach(function(key) {
      const attrRules = jsonRequest[key].split("|")

      for (var i = 0; i < attrRules.length; i++) {
        const propsParts = attrRules[i].split(":")
        let isValid;

        if (propsParts.length > 1) {
          const functionName = propsParts[0];
          const param_1 = req.body[key] ? req.body[key] : "";
          const param_2 = propsParts[1];

          isValid = helpers[functionName](key, param_1, param_2)
        } else {
          const functionName = propsParts[0];
          const param_1 = req.body[key] ? req.body[key] : "";

          isValid = helpers[functionName](key, param_1)
        }

        if (!isValid.status) {
          errors.push(isValid.error)
        }
      }

    })
  }

  if (errors.length > 0) {
    res.status(400)
    res.json({
      status: false,
      message: "Validation error on request.",
      errors: errors
    })
  } else {
    res.status(data.response_code)
    const response = createFromFaker(data.response, false, req.body)
    res.json(JSON.parse(response))
  }
}

async function apiRoute(req, res, next) {
  const username = req.params.username;
  const route = req.params.route;
  const method = req.method.toUpperCase();

  const user = await checkUser(username)

  faker.locale = user.locale ? user.locale : "en";

  Mock.findOneAndUpdate({user_id: user._id, route: route, method: method}, { $inc: { count: 1 } }).then(data => {

    returnData(req, res, data, {})

  }).catch(err => {
    const urlParts = route.split("/")

    Mock.find({user_id: user._id, method: method}).then(data => {
      let selectedMock;
      data.forEach((item, i) => {
        if (item.route.indexOf(":") > -1) {
          const routeParts = item.route.split("/")
          let status = true

          routeParts.forEach((routeItem, routeI) => {
            if (routeItem.indexOf(":") === -1 && routeItem !== urlParts[routeI]) {
              status = false
            } else if (routeItem.indexOf(":") > -1) {
              const key = routeItem.replace(":", "")

              req.body[key] = urlParts[routeI]
            }
          });

          if (status) {
            selectedMock = item
          }
        }
      });

      Object.keys(req.query).forEach((item, i) => {
        req.body[item] = req.query[item]
      });


      returnData(req, res, selectedMock)

    }).catch(err => {
      res.status(404)
      res.json({
        status: false,
        message: "Api couldn't found",
        error: err
      })
    })
  })
}

['get', 'post', 'delete', 'put', 'patch'].forEach((item, i) => {
  router[item]("/:username/:route(*)", apiRoute);
});


module.exports = router;
