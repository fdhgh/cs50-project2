function formatMessage(message){
  let new_row = document.createElement('tr');
  const utctimestamp = new Date(message.date);
  const localtimestamp = utctimestamp.toLocaleString();

  c_author = new_row.insertCell(0);
  c_content = new_row.insertCell(1);
  c_date = new_row.insertCell(2);
  c_author.innerHTML = "<b> " + message.author + " </b>";
  c_content.innerHTML = " " + message.content + " ";
  c_date.innerHTML = "<i> " + localtimestamp + " </i>";
  return new_row;
}

function formatChannel(channel){
  let new_row = document.createElement('tr');
  const c_channel = new_row.insertCell(0);
  const html_string = "<a href=" + channel + ">" + channel + "</a>";

  c_channel.innerHTML = html_string;
  return new_row
}


function listMessages(channel){

    const request = new XMLHttpRequest();
    let req_uri;
    if (window.location.pathname == "/"){
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
            document.querySelector('#message_table').appendChild(new_row);
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
      document.querySelector('#sendTest').onclick = () => {
        const content = document.querySelector("#message").value;
        socket.emit('send message', {'content': content, 'channel': channel});
      };

      document.querySelector('#sendChannel').onclick = () => {
        const channel = document.querySelector("#newChannel").value;
        if (channelExists(channel)){
          alert('Channel name already exists!');
        } else {
          socket.emit('add channel', {'channel': channel});
        }
      };


        // // Each button should emit a "submit vote" event
        // document.querySelectorAll('button').forEach(button => {
        //     button.onclick = () => {
        //         const selection = button.dataset.vote;
        //         console.log('You clicked vote');
        //         socket.emit('submit vote', {'selection': selection});
        //     };
        // });



    });

    // When a new vote is announced, add to the unordered list
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });

    socket.on('new message', data => {
        const new_row = formatMessage(data);
        document.querySelector('#message_table').appendChild(new_row);
    });

    socket.on('new channel', new_channel => {
        const new_row = formatChannel(new_channel)
        document.querySelector('#channel_table > tbody').appendChild(new_row);
    });




});
