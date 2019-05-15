/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var expect = require('chai').expect;
var server = require('../server');
var ObjectId = require('mongodb').ObjectID;
var idToTest;

chai.use(chaiHttp);
chai.should();
chai.use(require('chai-things'))

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          //get an id for the last functional delete test
          idToTest = ObjectId(res.body._id)
          expect(res.body).to.include({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA' 
        })
          done();
          
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
         .post('/api/issues/test')
         .send({
          issue_title: 'Different title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          
          expect(res.body).to.include({
            issue_title: 'Different title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in'
          })
          done();
        })
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
         .post('/api/issues/test')
         .send({
          issue_title: 'A newer title',
          issue_text: 'text'
        })
        
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required fields');
           done();
        })
       
      });
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
         .put('/api/issues/test')
        .send({})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no fields to update')
          done();
      })
        
    });
      test('One field to update', function(done) {
        chai.request(server)
         .put('/api/issues/test')
         .send({issue_title: 'An updated title'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          //testing for length of res 'successfully updated (24 character objectId)' => should equal 45
          assert.equal(res.text.length, 45)
          done();
        })
      });
      
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
         .put('/api/issues/test')
         .send({issue_title: "Another new title plus one more field", issue_text: "Some updated text"})
        .end(function(err, res) {
          assert.equal(res.status, 200)
          //testing for length of res 'successfully updated (24 character objectId)' => should equal 45
          assert.equal(res.text.length, 45)
          done();
        })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
         .get('/api/issues/test')
        .query({open: true})
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.equal(res.body[0].open, true)
          res.body.should.all.have.property('open', true)
          done();
        })
      });
      
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
         .get('/api/issues/test')
        .query({open: true, 
          issue_title: 'Different title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in'})
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_by')
          done();
        })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
         .delete('/api/issues/test')
         .send({})
         .end(function(err, res){
          assert.equal(res.status, 200)
          assert.equal(res.text, 'must provide id')
          done();
        })
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
         .delete('/api/issues/test')
         .send({_id: idToTest})
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success: deleted ' + idToTest)
          done();
        });
       
      });
      
      test('Check previous issue was deleted', function(done) {
        chai.request(server)
         .get('/api/issues/test')
         .query({_id: idToTest.toString()})
         .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body, false)
          done();
        })
      
      })
      
    });

});
