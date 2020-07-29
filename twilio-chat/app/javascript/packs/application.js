// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

const Rails = require("@rails/ujs")

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("chat")) {
    window.chat = new Chat();
  }
});


// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

Rails.ajax({
  url: "/tokens",
  type: "POST",
    success: function(data) { //code to create a new chat client with the token we've generated, and then check if the "general" channel exists.
      Twilio.Chat.Client 
        .create(data.token)
        .then(function(chatClient) {
          chatClient.getChannelByUniqueName("general")
            .then(function(channel){
              //general channel exists
            })
            .catch(function(){
              //general channel does not exist
              //we'll create the channel and join it, then log that we've joined the channel to ensure that it's working.
              chatClient.createChannel({
                uniqueName: "general",
                friendlyNtame: "General Chat Channel"
              }).then(function(channel) {
                if (channel.state.status !== "joined") {
                  channel.join().then(function(channel) {
                    console.log("Joined General Channel");
                  })
                }
              })
            })
        });
    } 
});