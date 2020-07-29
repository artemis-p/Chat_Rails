const Rails = require("@rails/ujs");

class Chat {
  constructor() {
    this.channel = null;
    this.client = null;
    this.identity = null;
    this.initialize();
  }
  //initializing variables with null value. We call an initialize method, which has the logic for fetching our token.

  initialize() {
    Rails.ajax({
      url: "/tokens",
      type: "POST",
      success: data => {
        this.identity = data.identity;

        Twilio.Chat.client
          .create(data.token)
          .then(client => this.setupClient(client));
      }
    });
  }

  //when the token is received, we create a client and then send the client to the setupClient method, which attempts to find or create the "general" channel. Once the channel is available, it's passed to a setupChannel method that stores a reference to the channel and calls the joinChannel method.

  joinChannel() {
    if (this.channel.state.status !== "joined") {
      this.channel.join().then(function(channel) {
        console.log("Joined General Channel");
      });
    }
  }
// checks that we haven't already joined the channel, then it joins the channel and logs the message that we created previously


  setupChannel(channel) {
    this.channel = channel;
    this.joinChannel();
  }
  
  setupClient(client) {
    this.client = client;
    this.client.getChannelByUniqueName("general")
      .then((channel) => this.setupChannel(channel))
      .catch((error) => {
        this.client.createChannel({
          uniqueName: "general",
          friendlyname: "General Chat Channel"
        }).then((channel) => this.setupChannel(channel));
      });
  }
};