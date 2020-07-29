const Rails = require("@rails/ujs");

class Chat {
  constructor() {
    this.channel = null;
    this.client = null;
    this.identity = null;
    this.messages = ["connecting..."];
    this.initialize();
  }
  //initializing variables with null value. We call an initialize method, which has the logic for fetching our token.

  initialize() {
    this.renderMessages(); //we need to call this so that the messages are actually displayed

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
    this.addMessage({ body: `Joined general channel as ${this.identity}` });
    this.channel.on("messageAdded", message => this.addMessage(message));
    this.setupForm();
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

  renderMessages() {
    let messagesContainer = document.querySelector(".chat .messages");
    messagesContainer.innerHTML = this.messages
      .map(message => `<div class="message>${message}</div>`)
      .join("");
  }
//this will built up the HTML for our messages and replace the body of the .messages div
  addMessage(message) {
    let html = "";

    if (message.author) {
      const className = message.author == this.identity ? "user me" : "user";
      html += `<span class="${classname}">${message.author}: </span>`;
    }

    html += message.body;
    this.messages.push(html);
    this.renderMessages();
  }
  //accepting a message object that has an author key and a body key. If the object does not include an author, then we just add the body of the message to the messages array. when an author is provided, we determine the appropriate CSS class for the author span tag by checking if the author matches the identity from the initialize method. If they are a match, we add a me class in addiyion to the user class on the message
  setupForm() {
    const form = document.querySelector(".chat form");
    const input = document.querySelector(".chat form input");

    form.addEventListener("submit", event => {
      event.preventDefault();
      this.channel.sendMessage(input.value);
      input.value = "";
      return false;
    });
  }
};