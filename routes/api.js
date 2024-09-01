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
    let hasIp = false;
    for(let i=0; i < hasStock.likes.length; i++){
     // console.log(hasStock.likes[i])
     if(bcrypt.compare(hasStock.likes[i], ip)) 
       hasIp = true;
    }
    console.log(hasIp)
    if(like=='true' && !hasIp){
      
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

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      console.log(req.query, "<------req.query ",req.params,"----params-body----", req.body);
      if(typeof req.query.stock==='string' || req.query.stock  instanceof String ){
         const { stock, like }  = req.query
      //const {symbol, latestPrice} =
      fetchStock(stock, async (symbol,latestPrice)=>{
        //console.log("symbol", symbol, "lPrice", latestPrice)
        if(!symbol){
          res.json({stockdata:{likes: like ? 1:0}}); 
          return;
          }
        const hash = bcrypt.hashSync(req.ip, 12);
        console.log("hash",hash)
        const datasaved = await saveStock(symbol, like, hash)
         // console.log("stdata", datasaved);
          //console.log(stock, like, datasaved);
        let likesnum = 0;
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
      fetchStock(stock1, async (symbol1, latestPrice1)=>{
       // console.log("symbol1", symbol1, "lPrice1", latestPrice1)
        if(!symbol1){
          res.json({stockdata:{likes: like ? 1:0}}); 
          return;
          }
      fetchStock(stock2, async (symbol2, latestPrice2)=>{
        //console.log("symbol2", symbol2, "lPrice2", latestPrice2)
        if(!symbol2){
          res.json({stockdata:{likes: like ? 1:0}}); 
          return;
        }
        const hash1 = bcrypt.hashSync(req.ip, 12);
        const datasaved1 = await saveStock(symbol1, like, hash1)
          //console.log("stdata1",datasaved1);
          //console.log(stock1, like, datasaved1);
        let likesnum1 =0;
        if(datasaved1) {
          likesnum1 = datasaved1.likes.length;
        }else{
          console.log("error")
        }
        const datasaved2 = await saveStock(symbol2, like, hash1)
          //console.log("stdata2", datasaved2);
          //console.log(stock2, like, datasaved2);
        let likesnum2 = 0;
        if(datasaved2) {
          likesnum2 = datasaved2.likes.length;
        }else{
          console.log("error")
        }
        let response = [{
          stock: symbol1,
          price: latestPrice1,
          rel_likes: likesnum1-likesnum2
          }, {
          stock: symbol2,
          price: latestPrice2,
          rel_likes: likesnum2-likesnum1
          } ]
        res.json({"stockData":response});
        
      }) ;          
      })//end two stock query             
        
          
    };
    })};