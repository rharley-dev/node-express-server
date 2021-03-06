const express = require('express');
const bodyParser = require('body-parser');
const Partner = require('../models/partner');
const authenticate = require('../authenticate');
const cors = require('./cors');

const partnerRouter = express.Router();

// since this is a express application .use is for attaching middleware
partnerRouter.use(bodyParser.json());

partnerRouter
  // .options to handle a preflight req
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .route('/')
  .get(cors.cors, (req, res, next) => {
    Partner.find()
      .then(partners => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners); // send json data to client and close res stream
      })
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Partner.create(req.body) // auto saves doc and creates a promise, (req.body) body parcer middleware
        .then(partner => {
          console.log('Partner Created ', partner);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(partner);
        })
        .catch(err => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('PUT operation not supported on /partners');
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Partner.deleteMany()
        .then(response => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

// Adding a route param to the end of the path (allows to store what the client sends as a part of the path as a route param)
partnerRouter
  // .options to handle a preflight req
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .route('/:partnerId')
  .get(cors.cors, (req, res, next) => {
    Partner.findById(req.params.partnerId)
      .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
      })
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `POST operation not supported on /partners/${req.params.partnerId}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Partner.findByIdAndUpdate(
        req.params.partnerId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then(partner => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(partner);
        })
        .catch(err => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Partner.findByIdAndDelete(req.params.partnerId)
        .then(response => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        })
        .catch(err => next(err));
    }
  );

module.exports = partnerRouter;
