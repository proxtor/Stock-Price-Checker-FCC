'use strict';
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const Stock = require('../collections').Stock;
const bcrypt = require('bcrypt');

const fetch = require('node-fetch');
let symbol;
let latestPrice;
let settings = { method: "Get" };

async function findStock(stock){
  return await Stock.findOne({ symbol: stock }).exec();  
}

async function createStock(stock, like, ip){
  let temp = [];
  if(like=='true') temp.push(ip)
  const newOne = new Stock({ symbol: stock,
                             likes: [...temp]})
  return await newOne.save()
  }

async function saveStock(stock, like, ip){
 // let saved ={};
  const hasStock = await findStock(stock);
  console.log("hasStock", hasStock)
  if(!hasStock){
    const newStock = await createStock(stock, like, ip);
   // console.log("newStock", newStock)
    return newStock
  }else{
    if(like=='true' && hasStock.likes.indexOf(ip)==-1){
      console.log(hasStock.likes.indexOf(ip))
      hasStock.likes.push(ip);
      const saved  = await hasStock.save();
     // console.log("saved" , saved)
      return saved;
    }else return hasStock
  }
}




async function fetchStock(stock, callback){
  let url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;

  fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
      symbol =  json.symbol;
      latestPrice =  json.latestPrice;
     // console.log("node-fetch",json)
     // console.log("symbol1", symbol, "lPrice1", latestPrice)
      callback(symbol, latestPrice)
    });
}




/* let https;
  try {
  https = require('node:https');
} catch (err) {
  console.log('https support is disabled!');
  }
  function getPrice(stock, callback){
     https.
        get("https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/aapl/quote", resp =>{
        let data = "";
        resp.on("data", dataChunk =>{
          data += dataChunk;
          //console.log(data)
        });
        resp.on("end", ()=>{
          let resdata = JSON.parse(data);
          console.log(resdata)
          callback(resdata);
        })
        })
  } */


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      console.log(req.query, "<------req.query ",req.params,"----params-body----", req.body);
      if(req.query.stock.length==1){
         const {  stock, like }  = req.query
      //const {symbol, latestPrice} =
      fetchStock(stock, async (symbol,latestPrice)=>{
        console.log("symbol", symbol, "lPrice", latestPrice)
        if(!symbol){
          res.json({stockdata:{likes: like ? 1:0}}); 
          return;
          }
        const datasaved = await saveStock(symbol, like, req.ip)
          console.log("stdata",datasaved);
          console.log(stock, like, datasaved);
        let likesnum =0;
        if(datasaved) {
          likesnum = datasaved.likes.length;
        }else{
          console.log("error")
        }
        let response = {
          stock: symbol,
          price: latestPrice,
          likes: likesnum
          } 
        res.json({"stockData":response})
        
      }) ;          
      } //end one stock query
      //start two stock query
      if(req.query.stock.length==2){
         const stock1  = req.query.stock[0]
         const stock2  = req.query.stock[1]
      //const {symbol, latestPrice} =
        const like = req.query.like
      fetchStock(stock1, async (symbol,latestPrice)=>{
        console.log("symbol", symbol, "lPrice", latestPrice)
        if(!symbol){
          res.json({stockdata:{likes: like ? 1:0}}); 
          return;
          }
        const datasaved = await saveStock(symbol, like, req.ip)
          console.log("stdata",datasaved);
          console.log(stock, like, datasaved);
        let likesnum =0;
        if(datasaved) {
          likesnum = datasaved.likes.length;
        }else{
          console.log("error")
        }
        let response = {
          stock: symbol,
          price: latestPrice,
          likes: likesnum
          } 
        res.json({"stockData":response})
        
      }) ;          
      } //end two stock query
           

              
        
      });     
    };
