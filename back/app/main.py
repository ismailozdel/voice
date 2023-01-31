from flask import Flask, request,jsonify
from flask_socketio import SocketIO,emit,join_room,send,leave_room
from flask_cors import CORS
from time import sleep
import sounddevice as sd

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app,cors_allowed_origins="*")

# dictionary to store room membership
users = {}
rooms = {}
file = open("asd.txt","a+b")
@socketio.on('join room')
def handle_join_room(data):
    print(data)
    room_name = data['room_name']
    join_room(room_name)
    client_id = request.sid

    # create the room if it doesn't exist
    if room_name not in rooms:
        rooms[room_name] = []
    # add the client to the room
    rooms[room_name].append(client_id)

@socketio.on('register')
def register(data):
    user_name = data['user_name']
    client_id = request.sid
    if user_name not in users:
        users[user_name] = []
    users[user_name].append(client_id)
    print(users)

@socketio.on("send notification")
def notification(data):
    target = data['target_user']
    user = data['user_name']
    if user in users and target in users:
        emit('notification',{'notification':user},to=users[target])

@socketio.on('audio_data')
def handle_audio_data(data):
    global file
    file.write(data['audio'])
    print(data['audio'])
    emit('audio_data', data['audio'],include_self=False,to=data['room'])
    """print(data)
    client_id = request.sid
    # find the room that the client is in
    for room_name, clients in rooms.items():
        if client_id in clients:
            # broadcast the audio data to all clients in the room
            emit('audio_data', data['data'], room=room_name,include_self=True)
            break"""

if __name__ == '__main__':
    socketio.run(app, debug=True,port=8000)


"""roomss = []
users = []
@app.route("/http-call")
def http_call():
    """"""return JSON with string data as the value""""""
    data = {'data':'This text was fetched using an HTTP call to server on render'}
    return jsonify(data)

@socketio.on("connect")
def connected():
    """"""event listener when client connects to the server""""""
    #print(request.sid)
    #print("client has connected")
    emit("connect",{"data":f"id: {request.sid} is connected"})

@socketio.on('data')
def handle_message(data):
    """"""event listener when client types a message""""""
    #print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)
a = 0
@socketio.on("disconnect")
def disconnected():
    """"""event listener when client disconnects to the server""""""
    #print("user disconnected")
    emit("disconnect",f"user {request.sid} disconnected",broadcast=True)

@socketio.on("join_room")
def on_join(data):
    username = data['username']
    room = data['room']
    sid = request.sid
    join_room(room)
    global roomss,users
    user = request.sid
    roomss.append({"username":username,"room":room,"sid":request.sid})
    users.append({})
    send(username + ' has entered the room.', to=room)


@socketio.on('leave_room')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', to=room)

@socketio.on('audio_data')
def handle_audio_data(data):
    # process the audio data and broadcast it to all connected clients
    #[x] = struct.unpack('f',data)
    print("------------------------------")
    print(rooms)
    print("------------------------------")
    room = list(filter(lambda user: user["sid"] == request.sid,rooms))
    print("///////////////////////////////")
    print(room)
    print("///////////////////////////////")
    room = rooms()[0]
    print(room)
    print(rooms())
    emit('audio_data', data['audio'], broadcast=False,include_self=False,to=room)

if __name__ == '__main__':
    socketio.run(app, debug=True,port=8000)"""