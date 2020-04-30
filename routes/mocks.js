var express = require('express');
var router = express.Router();
var Mock = require("../models/Mock");
const checkAuth = require('../middleware/checkAuth');

/* Mock Listeleme */
router.use(checkAuth)

router.get('/', function(req, res, next) {
  Mock.find({user_id: req.userData.id}).then((mocks) => {
    res.json(mocks);
  }).catch((err) => {
    res.json(err);
  });
});

/* Mock Ekleme */
router.post("/create", function(req, res, next){
  const { name, response_code, route, method, request, response } = req.body;

  new Mock({
    name: name,
    user_id: req.userData.id,
    method: method,
    route: route,
    response_code: response_code,
    request: request,
    response: response,
    date: new Date(),
    status: "active",
    count: 0
  }).save().then(() => {
    res.json({
      status: true,
      message: "Mock has been saved."
    });
  }).catch((err) => {
    res.status(400);
    res.json({
      status: false,
      message: "Mock has not been saved."
    });
  });

});

/* Mock Güncelleme */

router.put("/:id", function(req, res, next){

  var id = req.params.id;
  delete req.body.id

  Mock.findOneAndUpdate({"_id": id, user_id: req.userData.id}, req.body).then((newMock) => {
    res.json({
      status: true,
      message: "Mock has been updated.",
      data: req.body
    });
  }).catch((err) => {
    res.status(400)
    res.json({
      status: false,
      message: "Mock has not been updated."
    });
  });

});

/* Mock Silme */

router.delete("/:id", function(req, res, next){

  var id = req.params.id;
  Mock.findOneAndDelete({_id: id, user_id: req.userData.id}).then(() => {
    res.json({
      status: true,
      message: "Delete mock been deleted."
    });
  }).catch((err) => {
    res.status(400)
    res.json({
      status: false,
      message: "Mock has not been deleted."
    });
  });

});

/* Mock Görüntüleme */
router.get("/:id", function(req, res, next) {
  const id = req.params.id;
  Mock.findById(id).then(data => {
    res.json(data)
  }).catch(err => {
    res.json(err)
  })
});

/* Mock Api Response */
router.get("/api/:id", function(req, res, next) {
  const id = req.params.id;
  Mock.findById(id).then(data => {
    res.end(data.data)
  }).catch(err => {
    res.json(err)
  })
});


module.exports = router;
