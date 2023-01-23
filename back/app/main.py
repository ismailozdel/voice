from flask import Flask, request,jsonify
from flask_socketio import SocketIO,emit
from flask_cors import CORS
from time import sleep
import sounddevice as sd

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app,cors_allowed_origins="*")

@app.route("/http-call")
def http_call():
    """return JSON with string data as the value"""
    data = {'data':'This text was fetched using an HTTP call to server on render'}
    return jsonify(data)

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has connected")
    emit("connect",{"data":f"id: {request.sid} is connected"})

@socketio.on('data')
def handle_message(data):
    """event listener when client types a message"""
    print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)
a = 0
@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    print("user disconnected")
    global a
    print(a)
    emit("disconnect",f"user {request.sid} disconnected",broadcast=True)

@socketio.on('audio_data')
def handle_audio_data(data):
    # process the audio data and broadcast it to all connected clients
    #[x] = struct.unpack('f',data)
    global a
    a += 1
    emit('audio_data', data, broadcast=True,include_self=True)

if __name__ == '__main__':
    socketio.run(app, debug=True,port=8000)