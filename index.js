require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const bodyparser = require("body-parser");
const isE164PhoneNumber = require("is-e164-phone-number");
const { response } = require("express");
const sendingPhoneNumber = process.env.PHONE_NUMBER;

// Create a SW Client Using the Compatibility API SDK
const { RestClient } = require('@signalwire/compatibility-api')
const client = RestClient(process.env.PROJECT_ID, process.env.API_TOKEN, { signalwireSpaceUrl: process.env.SPACE_URL })


// Display home page from html file
app.use(bodyparser.urlencoded({ extended: true }));
app.use("/", express.static("html"));

// Create a text to speech webhook/ dialplan for 
app.post("/start", async (req, res, next) => {
  console.log(req.body);
  const response = new RestClient.LaML.VoiceResponse();

  dial = response.dial();
  dial.conference("Room1234");
  console.log(response.toString());
});

// Send an API request to SW with the webhook containing our TTS
app.post("/sendCall", async (req, res) => {
  let { phoneno, body } = req.body;
  const text_for_speech = body;
  if (!isE164PhoneNumber(phoneno)) return res.send("Invalid Phone Number");
  console.log("Sending call to phone number", phoneno);
  const call = await client.calls.create({
    url: process.env.APP_DOMAIN + '/start',
    //url:'https://jon-gray.signalwire.com/laml-bins/11b43497-ca08-4ded-9925-5b129ad46593',
    to: phoneno,
    from: sendingPhoneNumber,
  })

  console.log("Sending message to phone number", phoneno);
  sms_body= process.env.APP_DOMAIN
  client.messages
      .create({from: sendingPhoneNumber, // The number you bought from SignalWire,
        body: sms_body,
        to: phoneno})
      .then(message => console.log(message.sid))
      .done();
});


app.post("/sendSMS", async (req, res) => {
  console.log("Sending message to phone number", phoneno);
    client.messages
        .create({from: sendingPhoneNumber, // The number you bought from SignalWire,
          body: sms_body,
          to: phoneno})
        .then(message => console.log(message.sid))
        .done();

    console.log(status);
    return res.send("Your SMS was sent");
});

function respondAndLog(res, response) {
  //console.log("This is the response string " + response.toString());
  res.send(response.toString());
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});