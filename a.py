

from datetime import datetime
import json
import pytz

date=datetime.now(tz=pytz.utc)
print(date)
datems=date.timestamp()*1000
print(type(datems))
jsondate = json.dumps((date.timestamp()*1000), default=str)
print(jsondate)



# # dict of lists
# import random
# from datetime import datetime, timezone
#
# class Message:
#    def __init__(self, content, author, channel):
#        self.content=content
#        self.author=author
#        self.channel=channel
#        self.date=datetime.now(timezone.utc)
#
# authorlist = ['bob','ann','cam','dave','jim','bob','ann','ted','bob']
# roomlist = ['general','work','random', 'admin']
# channelMessages = {}
# i=0
# for author in authorlist:
#     content = ('this is message #' + str(i))
#     room = roomlist[random.randint(0,len(roomlist)-1)]
#     msg = Message(content, author, room)
#     if room in channelMessages:
#         channelMessages[room].append(msg)
#     else:
#         channelMessages[room] = [msg]
#     i += 1
#
# for room in roomlist:
#     if room in channelMessages:
#         print(room + ' messages: ')
#         print('containing ' + str(len(channelMessages[room])) +' messages')
#         for j in channelMessages[room]:
#             print(j.content + ' sent on ' + str(j.date))
#
