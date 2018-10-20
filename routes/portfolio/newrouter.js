const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {portfolio} = require('./models');

console.log('can you hear me CRUD router!')

const jwtAuth = require('passport').authenticate('jwt', {
  session: false,
  //change
  failureRedirect: 'auth/login'
});

// my GET mongo endpoint
router.get('/', jwtAuth, (req,res) =>{
   portfolio.find({ user: req.user.id }).then(posts =>{
      res.json(posts.map(post=> post.serialize()));
    })
    .catch(err =>{
      // console.log(err);
      res.status(500).json({error:'Internal Server Error'})
    });
  });

//my Get mongo endpoint by ID
router.get('/:id',(req,res) => {

  portfolio
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
      .catch(error =>{
      // console.log(error);
      res.status(500).json({error:'Internal Server Error'})
    });
});

//My Post Endpoint for Mongo
router.post('/', (req,res) => {
  const requiredkeys = ['name','symbol','description','user'];

  for(let i = 0;i<requiredkeys.length;i++){
    const selector = requiredkeys[i];
    if(!(selector in req.body)){
      const message = `${selector} is not in the body`
      return res.status(400).send(message);
    }
  }

  portfolio
    .create({
      user: req.body.user,
      name: req.body.name,
      description: req.body.description,
      symbol: req.body.symbol,
      image: req.body.image,
    })
    .then(portfolioPost => res.status(201).json(portfolioPost.serialize()))
    .catch(err => {
      // console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});



//My delete endpoint
 router.delete('/:id', (req, res) => {
  portfolio
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong while deleting' });
    });
});



// my put endpoint
router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['name', 'image', 'description','user'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  portfolio
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});




module.exports = {router};