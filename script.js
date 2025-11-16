/*
Name: Easton Martin
Description: Contains functions to assist in the Slack Message project.
*/

function changeChannel(e) {
  let currentActive = document.querySelector(".active");
  if (currentActive) {
    currentActive.classList.remove("active");
  }
  e.currentTarget.classList.add("active");
  populateMessages(e.currentTarget.getAttribute("data-channel"));
  document.querySelector("#channel-title").innerText =
    e.currentTarget.innerText;
}

function populateMessages(chat) {
  document.querySelectorAll(".message").forEach((item) => item.remove());
  let template = document.querySelector("template");
  let chatMessages = document.querySelector("#chat-messages");
  // get the messages for this channel using the API
  fetch(`https://slackclonebackendapi.onrender.com/messages?channelId=${chat}`).then((res)=>res.json()).then((messages)=>{
    // loop through each of the messages returned
    for (let i = 0; i < messages.length; i++){
      let message = messages[i];
      // get the information about the sender for each message and add it to the chat
      fetch(`https://slackclonebackendapi.onrender.com/users?id=${message.senderId}`).then((res)=>res.json()).then((users)=>{
        let user = users[0];
        let newMessage = template.content.cloneNode(true);
        newMessage.querySelector(".sender").innerText = user.name + ":";
        newMessage.querySelector(".text").innerText = message.content;
        chatMessages.appendChild(newMessage);
      });
    }
  });
}

// create a send message function EXTRA CREDIT
async function sendMessage(){
  let input = document.querySelector("#message-input");
  let text = input.value.trim();
  // if the message is empty it will not be sent
  if (text === ""){
    return;
  }
  // find the active channel to know where to send the message to
  let activeChannel = document.querySelector(".channel.active");
  if (!activeChannel){
    return;
  }
  // find the channelID
  let channelId = activeChannel.dataset.channel;
  let randomSenderId = Math.floor(Math.random()*10)+1;
  // POST request to the API
  await fetch("https://slackclonebackendapi.onrender.com/messages", {
    method: "POST",
    headers: {"Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: text,
    channelId: Number(channelId),
    senderId: randomSenderId,
    }),
  });
  // follow the formatting of other messages and add the message to the chat screen
  let template = document.querySelector("template");
  let chatMessages = document.querySelector("#chat-messages");
  let newMessage = template.content.cloneNode(true);
  newMessage.querySelector(".sender").innerText = "You";
  newMessage.querySelector(".text").innerText = text;
  newMessage.querySelector(".message").classList.add("self");
  chatMessages.appendChild(newMessage);
  // clear the input box
  input.value = "";
}


async function init(){
  // get a response from the API and convert to json
  let res = await fetch("https://slackclonebackendapi.onrender.com/channels");
  let channels = await res.json();
  // determine the channel list to be used in the for loop
  let channelList = document.querySelector(".channel-list");
  // for loop to create new buttons, add the channel class, etc.
  for (let i = 0; i < channels.length; i++){
    let btn = document.createElement("button");
    btn.classList.add("channel");
    btn.dataset.channel = channels[i].id;
    btn.innerText = channels[i].name;
    channelList.appendChild(btn);
  }
    document
      .querySelectorAll(".channel")
      .forEach((item) => item.addEventListener("click", changeChannel));
  
}

// added the EventListener to send messages
document
  .querySelector("#chat-form button")
  .addEventListener("click", sendMessage);

init();
