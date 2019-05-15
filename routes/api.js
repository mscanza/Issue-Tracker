/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var helmet = require('helmet')

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  app.use(helmet());
  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    
    if (err) {
      return err;
    } else {
      console.log('Connected to Database');
      
    app.route('/api/issues/:project')
      .get(function (req, res){
      if (req.query.hasOwnProperty('_id')) {
      var id = ObjectId(req.query._id);
      req.query._id = id;      
      }
      if (req.query.open === 'true') {
        req.query.open = true;
      }
        var project = req.params.project;
      db.collection(project).find(req.query).toArray().then(docs => res.json(docs))
    }
    )
    
    .post(function (req, res){
      var project = req.params.project;
      
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.send('missing required fields')
      }
        db.collection(project).insertOne({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by || '',
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        }, function(err, doc) {
        if (err) {
          console.log(err)
        } else {
        res.json(doc.ops[0])
          return doc;
        }
        })
    })
    
    .put(function (req, res){
      var project = req.params.project;
      let id;
      try {
      id = ObjectId(req.body._id);
      } catch(err) {
      return res.send(`Invalid Id`)
      }
      var toUpdate = { $set:{} };
  
      //So the id doesn't update
      // req.body._id = ''

      for (let key in req.body) {
        if (key !== '_id') {
          if (req.body[key]) {
          toUpdate.$set[key] = req.body[key]
        }
        }
      }
      //No fields are present
      if (Object.entries(toUpdate.$set).length === 0 && toUpdate.$set.constructor === Object) {
        return res.send('no fields to update')
      }
      //Set updated_on
      toUpdate.$set.updated_on = new Date();

      // console.log(toUpdate)

      db.collection(project).findAndModify(
        {_id: id},
        {},
        toUpdate,
        {new: true}
      ,function(err, doc) {
         res.send(`Successfully updated ${id}`);
      })
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      if (project !== 'apitest' && project !== 'test') {
        return res.send('failed: Can only edit issues on the following projects: "apitest", "test"')
      }
     let id;
      if (!req.body._id) {
       return res.send('must provide id')
      }
      try {
      id = ObjectId(req.body._id);
      } catch(err) {
      return res.send(`Invalid Id`)
      }
       db.collection(project).remove(
         {_id: id},
         {justOne: true}
       ,function(err, doc) {
         if (err) {
           return res.send(`could not update ${id}`)
         }
         return res.send(`success: deleted ${id}`)
       }) 
    });
      
      app.use(function(req, res, next) {
      res.status(404)
    .type('text')
    .send('Not Found');
});
    
    }
  
  });


    
};
