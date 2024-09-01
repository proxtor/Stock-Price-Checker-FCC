const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const mongoose = require('mongoose');
const Stock = require('../collections').Stock;
let likes_test1;
let likes_test2;
let likes1;
let likes2;
let abrv='goog';
let symb = 'GOOG';
let abrv2='tsla';
let symb2='TSLA';
chai.use(chaiHttp);

Stock.findOneAndDelete({symbol:"GOOG"}, function(err, data){
  if(err) console.log("err",err)
  console.log("no GOOG, ready for testing");
  
  
})
Stock.findOneAndDelete({symbol:"TSLA"}, function(err, next){
  if(err) console.log("err",err)
  console.log("no TSLA, ready for testing");   
})

suite('Functional Tests', function() {
  
  suite('One stock: GET request to /api/stock-prices/', function(){
    //#1 Viewing one stock: GET request to /api/stock-prices/
      test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
        chai
        .request(server)
        .get('/api/stock-prices/')
        .query({ stock: abrv, like: 'false'})
        .end(function(err, res){
          if (err) return console.log(err);
               console.log('res.body #1----', res.body)
          likes_test1=res.body.stockData.likes;
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, symb);
          assert.isObject(res.body, 'returned is object');
          assert.property(res.body, 'stockData', 'res should include stockData');
          assert.property(res.body.stockData, 'price', 'res include price');
          done();
       });       
      });
    //#2 Viewing one stock and liking it: GET request to /api/stock-prices/
      test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
        chai
        .request(server)
        .get('/api/stock-prices/')
        .set("content-type", "aplication/json")  
        .query({ stock: abrv, like: 'true'})
        .end(function(err, res){
          if (err) return console.log(err);
                  console.log('res.body #2----', res.body);
          likes_test2 = likes_test1 +1;
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, symb);
          assert.isAtLeast(res.body.stockData.likes, 1 ,'there is at least 1 like');
          assert.equal(res.body.stockData.likes, likes_test2, 'likes increase with 1');
          assert.isObject(res.body, 'returned is object');
          assert.property(res.body, 'stockData', 'res should include stockData');
          assert.property(res.body.stockData, 'price', 'res include price');   
          assert.property(res.body.stockData, 'likes', 'res include likes');   
          done();
       });       
      });
    //#3Viewing the same stock and liking it again: GET request to /api/stock-prices/
      test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
        chai
        .request(server)
        .get('/api/stock-prices/')
        .set("content-type", "aplication/json")  
        .query({ stock: abrv, like: 'true'})
        .end(function(err, res){
          if (err) return console.log(err);
                  console.log('res.body #3----', res.body);
          
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, symb);
          assert.isAtLeast(res.body.stockData.likes, 1 ,'there is at least 1 like');
          assert.equal(res.body.stockData.likes, likes_test2,'likes number is unchanged');
          assert.isObject(res.body, 'returned is object');
          assert.property(res.body, 'stockData', 'res should include stockData');
          assert.property(res.body.stockData, 'price', 'res include price');         
          assert.property(res.body.stockData, 'likes', 'res include likes');         
          done();
       });       
      });
  })//end one suite tests
  suite('Two stocks: GET request to /api/stock-prices/', function(){
    //#4 Viewing two stocks: GET request to /api/stock-prices/
      test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
        chai
        .request(server)
        .get('/api/stock-prices/')
        .query({ stock: [abrv , abrv2], like: 'false'})
        .end(function(err, res){
          if (err) return console.log(err);
               console.log('res.body #4----', res.body)
         // likes1=res.body.stockData.likes;
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, symb);
          assert.equal(res.body.stockData[1].stock, symb2);
          assert.isObject(res.body, 'returned is object');
          assert.property(res.body, 'stockData', 'res should include stockData');
          assert.property(res.body.stockData[0], 'price', 'res include price');
          assert.property(res.body.stockData[1], 'price', 'res include price');
          done();
       });       
      });
    //#5 Viewing two stocks and liking them: GET request to /api/stock-prices/
      test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
        chai
        .request(server)
        .get('/api/stock-prices/')
        .query({ stock: [abrv , abrv2], like: 'true'})
        .end(function(err, res){
          if (err) return console.log(err);
               //console.log('res.body #5----', res.body)
          likes1=res.body.stockData[0].rel_likes;
          likes2=res.body.stockData[1].rel_likes;
          
          assert.equal(res.status, 200);
          assert.equal(likes1,likes2*-1, "rel_likes ");
          assert.equal(res.body.stockData[0].stock, symb);
          assert.equal(res.body.stockData[1].stock, symb2);
          assert.isObject(res.body, 'returned is object');
          assert.property(res.body, 'stockData', 'res should include stockData');
          assert.property(res.body.stockData[0], 'price', 'res include price');
          assert.property(res.body.stockData[1], 'price', 'res include price');
          assert.property(res.body.stockData[0], 'rel_likes', 'res include rel_likes');
          assert.property(res.body.stockData[1], 'rel_likes', 'res include rel_likes');
          done();
       });       
      });

  
  })//end two suite tests
  
});

