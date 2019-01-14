const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');

// Load recipes Model
require('../models/Recipe');
const Recipe = mongoose.model('recipes');

// List recipes
router.get('/', function(req, res) {
  Recipe.find({}).then(recipes => {
    //console.log(recipes);
    res.render('index', {
      recipes: recipes
    });
  });
});

// Add recipe
router.post('/add', ensureAuthenticated, function(req, res) {
  let errors = [];

  if (!req.body.name) {
    errors.push({ text: 'Please add recipe name' });
  }
  if (!req.body.ingredients) {
    errors.push({ text: 'Please add ingredients' });
  }
  if (!req.body.directions) {
    errors.push({ text: 'Please add directions' });
  }

  if (errors.length > 0) {
    res.render('index', {
      errors: errors,
      name: req.body.name,
      ingredients: req.body.ingredients,
      directions: req.body.directions
    });
  } else {
    const newUser = {
      name: req.body.name,
      ingredients: req.body.ingredients,
      directions: req.body.directions
    };
    new Recipe(newUser).save().then(recipe => {
      req.flash('success_msg', 'Recipe added!');
      res.redirect('/');
    });
  }
});

// Edit recipe get
router.get('/edit/:id', ensureAuthenticated, ensureAuthenticated, function(
  req,
  res
) {
  Recipe.findOne({
    _id: req.params.id
  }).then(recipe => {
    //console.log(recipe);
    res.render('edit', {
      recipe: recipe
    });
  });
});

// Edit recipe post
router.put('/edit/:id', ensureAuthenticated, function(req, res) {
  Recipe.findOne({
    _id: req.params.id
  }).then(recipe => {
    recipe.name = req.body.name;
    recipe.ingredients = req.body.ingredients;
    recipe.directions = req.body.directions;

    recipe.save().then(recipe => {
      req.flash('success_msg', 'Recipe updated!');
      res.redirect('/');
    });
  });
});

// Delete recipe
router.delete('/delete/:id', ensureAuthenticated, function(req, res) {
  Recipe.remove({
    _id: req.params.id
  }).then(() => {
    req.flash('success_msg', 'Recipe deleted!');
    res.redirect('/');
  });
});

module.exports = router;
