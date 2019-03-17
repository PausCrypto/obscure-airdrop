const ObscureTipPassword = require('./password.js')
let obscureTip = new ObscureTipPassword()


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});
//create a schema

var schema = new mongoose.Schema({
  id: String,
  address: String,
  timeClaim: Number,
  claimStatus: Number
})

//lets compile the model, each user will get 1 model with 1 address
var AddressModel = mongoose.model('addressModel',schema)

const Discord = require('Discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  // If the message is "ping"
  if(message.content == ("!time")){
    AddressModel.findOne({'id':message.author.id},function(err,addressModel) {
      if(addressModel == null) {
        message.channel.send("You have yet to register for an airdrop, type !airdrop")
      }else {
        timeStart = addressModel.timeClaim
        console.log(timeStart)
        currentTimeLeft = secondToDayConverter((timeStart + 1210000) - Date.now())
        message.channel.send("You still have to wait: " + currentTimeLeft.toFixed(2) + " days ")
      }
    })
  }
  if(message.content.includes('!airdrop')) {
    if (message.content.includes('!airdrop XSC')) {
      AddressModel.findOne({'id':message.author.id},function(err,addressModel) {
        if(err) return handleError(err);
        if(addressModel == null) {
          //The particular user has no address associated to it so we have to create once
          // id of the user is message.author.id
          // create new address for user.
          if(message.content.substring(9).length !== 98) {
            message.channel.send("The address you input is of the incorrect format!")
          }else {
            message.channel.send("Claiming airdrop")
            var poolInfo = {
              id:message.author.id,
              address: message.content.substring(9),
              timeClaim: Date.now(),
              claimStatus: 1
            }
            var addressModel = new AddressModel(poolInfo)
            addressModel.save(function(err) {
              if (err) return handleError(err);
              message.channel.send("Registered airdrop to your account:")
              message.channel.send(poolInfo.address)
              message.channel.send("Type !claim to claim your airdrop to your address")
              message.channel.send("Type !time to check how many time left")
            })
          }

        } else {
          message.channel.send("You already filed your claim, use !claim instead")

        }
      })
    }else {
      if (message.content != "please append your address to the end of !airdrop") {
          message.channel.send("please append your address to the end of !airdrop")
      }

    }
  }
    // Send "pong" to the same channel
    //first lets ping mongoDB for any addressModels which has already been created

  if(message.content === '!claim'){

    //first lets find our addresses
    AddressModel.findOne({'id':message.author.id},function(err,addressModel) {
      if(addressModel != null) {
        if(addressModel.timeClaim - Date.now() >= 1.21e+6 ) {
          message.channel.send("2 weeks have elapsed, we've credited you 50 XSC :)")
          message.channel.send("Creating transaction to address: ")
          message.channel.send(addressModel.address)

        }else if(addressModel.timeClaim - Date.now() <= 1.21e+6){
          message.channel.send("2 weeks have yet to be elapsed")
          timeStart = addressModel.timeClaim
          console.log(timeStart)
          currentTimeLeft = secondToDayConverter((timeStart + 1210000) - Date.now())
          message.channel.send("You still have to wait: " + currentTimeLeft.toFixed(2) + " days ")
        }
      }else {
        message.channel.send("You have yet to file your claim, type !airdrop.")
        message.channel.send("You will be able to cashout the airdrop 2 weeks later :)")
      }
    });
  }


  if(message.content === "!delete") {
    AddressModel.deleteMany({ id: message.author.id }, function (err) {
        if (err) return handleError(err);
        console.log("deleted")
    });
  }
});

function secondToDayConverter(seconds) {
  return seconds/86400
}

client.login(obscureTip.token);
