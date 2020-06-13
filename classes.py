from datetime import datetime

class Channel:
  def __init__(self, name):
    self.name = name
    self.messages = []

  def addMessage(self, message):
      self.messages.append(message)

      if len(self.messages)>100:
          self.messages.pop(0)

class Message:
    def __init__(self, content, author, channel):
        self.content=content
        self.author=author
        self.channel=channel
        self.date=datetime.datetime.now(timezone.utc)

class User:
  def __init__(self, name):
    self.name = name
