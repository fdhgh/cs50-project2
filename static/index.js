var global_last_date = new Date(0);

function pathIsSlash(){
  if (window.location.pathname == "/"){
    return true;
  } else {
    return false;
  }
}

function new_day(new_timestamp){

    const new_date = new_timestamp.getDate();
    const new_month = new_timestamp.getMonth();
    const new_year = new_timestamp.getFullYear();

    const last_date = global_last_date.getDate();
    const last_month = global_last_date.getMonth();
    const last_year = global_last_date.getFullYear();
    if (new_date !== last_date || new_month !== last_month || new_year !== last_year){
      let new_row = document.createElement('tr');
      const localtimestamp = new_timestamp.toLocaleDateString();
      const c_new_date = new_row.insertCell(0);

      c_new_date.setAttribute("Colspan", "3");
      c_new_date.setAttribute("style", "text-align: center");
      c_new_date.innerHTML = "<b><i> " + localtimestamp + " </i></b>";
      document.querySelector('#message_table').appendChild(new_row);

      global_last_date = new_timestamp;
      }
  return false;
}

function formatMessage(message){
  let new_row = document.createElement('tr');
  const utctimestamp = new Date(message.date);
  new_day(utctimestamp);
  global_last_date = utctimestamp;
  const localtimestamp = utctimestamp.toLocaleTimeString();

  const c_author = new_row.insertCell(0);
  const c_content = new_row.insertCell(1);
  const c_date = new_row.insertCell(2);

  c_author.innerHTML = "<b> " + message.author + " </b>";
  c_content.innerHTML = " " + message.content + " ";
  c_date.innerHTML = "<i> " + localtimestamp + " </i>";

  return new_row;
}

function formatChannel(channel){
  let new_row = document.createElement('tr');
  const c_channel = new_row.insertCell(0);

  let ch_url;
  if (pathIsSlash()){
    ch_url = "channel/"; /// add 'channel' prefix to href if not in current path
  } else {
    ch_url = "";
  }

  const html_string = "<a href=" + ch_url + channel + ">" + channel + "</a>";

  c_channel.innerHTML = html_string;
  return new_row
}

function listNewMessage(new_row){

  const scrollbox = document.querySelector('#message_scrollbox');
  document.querySelector('#message_table').appendChild(new_row);
  scrollbox.scrollTo(0,scrollbox.scrollHeight);

}


function listMessages(channel){

    const request = new XMLHttpRequest();
    let req_uri;
    if (pathIsSlash()){
      req_uri = 'channel/messages/';
    } else {
      req_uri = 'messages/';
    }
    request.open('GET', req_uri + channel);

    request.onload = () => {
      // Extract JSON data from request
      const data = JSON.parse(request.responseText);
      const messages = data["messages"];
	    for (var i = 0, len = messages.length; i < len; i++) {
		        const new_row = formatMessage(messages[i]);
            listNewMessage(new_row);
	    }
    }
    request.send();
    };

function channelExists(new_channel){
  let channelList = [];
  document.querySelectorAll('#channel_table > tbody > tr > td > a').forEach(tda => {
    channelList.push(tda.innerHTML);
  });
  if (channelList.includes(new_channel)) {
    return true;
  } else {
    return false;
  }

}

document.addEventListener('DOMContentLoaded', () => {

    const channel = document.querySelector('#message_table_header').innerHTML;
    listMessages(channel);

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

      // send button emits send message event
      document.querySelector('#messageForm').onsubmit = () => {
        const message_field = document.querySelector("#message");
        const content = message_field.value;

        if(content=="" || content == null || content.trim() == ""){
          // document.querySelector("#message").classList.add("border border-warning");
          alert('Cannot send an empty message!');
        }else{
          socket.emit('send message', {'content': content, 'channel': channel});
          message_field.value = "";
        }
        return false;
      };

      document.querySelector('#channelForm').onsubmit = () => {
        const channel_field = document.querySelector("#newChannel");
        const channel = channel_field.value;

        if (channel=="" || channel == null || channel.trim() == ""){
          alert('Channel name cannot be blank!');
        } else if (channelExists(channel)){
          alert('Channel name already exists!');
        } else {
          socket.emit('add channel', {'channel': channel});
          channel_field.value = "";
        }
        return false;
      };
    });

    socket.on('new message', data => {
        const new_row = formatMessage(data);
        listNewMessage(new_row);
    });

    socket.on('new channel', new_channel => {
        const new_row = formatChannel(new_channel)
        document.querySelector('#channel_table > tbody').appendChild(new_row);
    });




});
