const express = require('express');
const bodyParser = require('body-parser'); 
var app = express();
var fs = require('fs');
var http = require('http');
var https = require('https');
var cors = require('cors');
var privateKey  = fs.readFileSync(`${__dirname}/ssl/server.key`, 'utf8');
var certificate = fs.readFileSync(`${__dirname}/ssl/server.crt`, 'utf8');
var ca_bundle = fs.readFileSync(`${__dirname}/ssl/ca_bundle.crt`, 'utf8'); 
var credentials = {key: privateKey, cert: certificate,ca:[ca_bundle]};
var jsonParser = bodyParser.json();
const rooms = {};

const updateRoom =  (req, res) => {

  var { room,peerId,password} = req.params;
  if(req.body!==undefined){
    rooms[room].peers = req.body
    res.json({"status":"updated"})
  }else{
    res.json({"status":"fail","error":"No Peer List Provided"})

  }

}
  const getRoom =  (req, res) => {

  var { room,peerId,password} = req.params;

    if(peerId){
    if (!rooms[room]) rooms[room] = {password,peers:[peerId]};
    else if(!rooms[room].peers.includes(peerId)){
      rooms[room].peers.push(peerId);
    }
    if(password===rooms[room].password){
      res.json({success:true,peers:rooms[room].peers});
    }else{
      res.json({sucess:false,error:"Incorrect Password"})
    } 
  }else{
    res.json({succss:false,error:"No peerId Provided"})
  }
} 


app.use(cors())
app.get("/", (req, res) => {
  var roomData = Object.keys(rooms).map((roomid)=>{
    var locked = (rooms[roomid].password)?true:false
    return {locked,name:roomid,count:rooms[roomid].peers.length}
  })
  console.log(roomData)
  res.json({success:true,rooms:roomData});
});
app.get("/:room/:peerId/:password",getRoom);
app.get("/:room/:peerId/",getRoom)
app.post("/:room/:peerId/:password",jsonParser,updateRoom);
app.post("/:room/:peerId/",jsonParser,updateRoom)


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
 
httpServer.listen(8080);
httpsServer.listen(8443);