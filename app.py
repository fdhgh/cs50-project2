import os
from datetime import datetime

from flask import Flask, render_template, session, request, redirect, url_for, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit
from datetime import datetime
import pytz
import json

app = Flask(__name__)
# Configure session to use filesystem
# app.config["SESSION_PERMANENT"] = False     #
# app.config["SESSION_TYPE"] = "filesystem"   #
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = []
channels = {'general': []} ## initialise channels dict with general channel
channelNames = ['general']

def createMessage(content, author, channel):
    date=datetime.now(tz=pytz.utc).timestamp()*1000 # timestamp in milliseconds
    #jsondate = json.dumps(date, default=str)
    message = {'content': content, 'author': author, 'channel': channel, 'date': date}
    return message

def setCurrentChannel(channelName):
    session["current_channel"] = channelName

def getCurrentChannel():
    current_channel = session.get("current_channel", False)
    if current_channel:
        return current_channel
    else:
        return False

def getCurrentUser():
    user = session.get("username", False)
    if user:
        return user
    else:
        return False

@app.before_request
def before_request():
    currentUser=getCurrentUser()
    if not currentUser and request.endpoint not in ['login']:
        return redirect(url_for('login'))


@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method=='POST':
        username = request.form.get("registerUsername")
        if (username in users) or (username == ''):
            return render_template("login.html", message="Username already taken.")
        else:
            users.append(username)
            session["username"] = username
            return redirect(url_for("index"))
    else: # if method is GET
        if session.get("username", False):
            return redirect(url_for("index"))
        else:
            return render_template("login.html")

@app.route("/logout")
def logout():
    currentUser = getCurrentUser()
    currentChannel = getCurrentChannel()
    if currentUser:
        session.pop('username', None)
        if currentUser in users:
            users.remove(currentUser)
    if currentChannel:
        session.pop('current_channel', None)
    return redirect(url_for("index"))

@app.route("/")
def index():

    currentChannel = getCurrentChannel()
    if not currentChannel or (currentChannel not in channelNames):
        currentChannel = 'general' # if channel not in session, default to general
        setCurrentChannel(currentChannel)
    data = {'channel': currentChannel, 'channels': channelNames, 'users': users }
    return render_template("index.html", data=data)

@app.route("/channel/<channel>")
def channel(channel):
    if channel not in channelNames:
        return redirect(url_for("index"))
    else:
        setCurrentChannel(channel)
        data = {'channel': channel, 'channels': channelNames, 'users': users }
        return render_template("index.html", data=data)

@app.route("/channel/messages/<channel>", methods=['GET'])
def messages(channel):
    data = {'messages': channels[channel]}
    return jsonify(data)

# @socketio.on("submit vote")
# def vote(data):
#     print("===============================================")
#     print("SO YOU WANT TO VOTE")
#     print("===============================================")
#     selection = data["selection"]
#     votes[selection] += 1
#     emit("vote totals", votes, broadcast=True)

@socketio.on("send message")
def send(data):

    content = data["content"]
    channel = data["channel"]
    # date = data["timestamp"]

    author = getCurrentUser()
    currentChannel = channels[channel]
    message = createMessage(content, author, channel)
    currentChannel.append(message)

    if len(currentChannel)>100:
        currentChannel.pop(0)

    emit("new message", message, broadcast=True)

@socketio.on("add channel")
def addChannel(data):
    name=data["channel"]
    channels[name] = []
    channelNames.append(name)
    emit("new channel", name, broadcast=True)



# @socketio.on("add channel")
# def addChannel(channelName):
#     ### move much of this logic to JS?
#     if channelName in channels:
#         print('Channel name must be unique')
#     else:
#         channels.append(new Channel(channelName))
#         emit("new channel", channels, broadcast=True)
