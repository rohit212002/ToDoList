const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth');

// load helper


const Handlebars = require('handlebars');
Handlebars.Utils.escapeExpression = function (expr) {
  return expr;
};
// const exphbs = require('express-handlebars');


// load schema
require('../models/Todo');
const Todo = mongoose.model('todos');

// Todo Index Page

// function formatDateToYYYYMMDD(timestamp) {
//   const date = new Date(timestamp);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

router.get('/', ensureAuthenticated, (req, res) => {
  Todo.find({ user: req.user.id }).sort({ creationDate: 'descending' }).lean().exec((err, todos) => {
    // let tt = formatDateToYYYYMMDD(Date.now());
    // console.log(tt);
    // console.log(todos);

    if (err) {
      // Handle the error
      console.log('err', err);
    } else {
      res.render('todos/index', {
        today: tt,
        todos: todos
      });
    }
  });
});


// add todo form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('todos/add');
});

// edit todo form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const todoId = req.params.id;
  console.log('todoId:', todoId);

  if (!todoId) {
    req.flash('error_msg', 'Todo ID not provided');
    return res.redirect('/todos');
  }
  Todo.findOne({
    _id: todoId
  }).then(todo => {
    if (todo.user != req.user.id) {
      req.flash('error_msg', 'Not authorized');

      res.redirect('/todos');
    } else {
      res.render('todos/edit', {

        id: todo._id,
        title: todo.title,
        dueDate: todo.dueDate,
        details: todo.details

      });
    };
  })
});



// process  form
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please add title'
    })
  }
  if (!req.body.details) {
    errors.push({
      text: 'Please add some details'
    })
  }

  if (errors.length > 0) {
    res.render('todos/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      dueDate: req.body.duedate
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
      dueDate: req.body.duedate
    };
    new Todo(newUser).save().then(todo => {
      req.flash('success_msg', 'Todo added');
      res.redirect('/todos');
    })
  }
});

// edit form process
router.put('/edit/:id', ensureAuthenticated, (req, res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(todo => {
    // new values
    todo.title = req.body.title;
    todo.details = req.body.details;
    todo.dueDate = req.body.duedate;
    todo.save().then(todo => {
      req.flash('success_msg', 'Todo updated');
      res.redirect('/todos');
    });
  });
});

// delete Todo
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Todo.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash('success_msg', 'Todo removed');
    res.redirect('/todos');
  })
});



module.exports = router;
