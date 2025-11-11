import { useEffect, useState } from 'react';
import './App.css';
import Image from './assets/profissao-programador.jpg';
import SendMessageIcon from './assets/send.png';
import { io } from 'socket.io-client';
import { 
  UserMyMessage,
  UserOtherMessage,
  UserOtherMessageName
 } from './styles';

const socket = io("http://localhost:4000", { autoConnect: false });

function App() {

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [colors, setColors] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState("");

  const switchChat = (name) => {
    setActiveChat(name);
    const title = document.getElementsByClassName('title-message2')[0];
    const groupUsers = document.getElementsByClassName('group-users')[0];
    const imageProfileTop = document.getElementsByClassName('image-profile-top')[0];
    const chatMessagesArea = document.getElementsByClassName('chat-messages-area')[0];

    chatMessagesArea.innerHTML = '';
    groupUsers.innerHTML = '';
    imageProfileTop.src = '';
    title.innerHTML = name;
    imageProfileTop.alt = name.charAt(0);
  };

  useEffect(() => {
    socket.connect();

    socket.on("users", (users) => {
  setUsers(users);

  setColors((prev) => {
      const updated = [...prev];
      users.forEach((user) => {
        if (!updated.find((c) => c.name === user.name)) {
          updated.push({
            name: user.name,
            color: Math.floor(Math.random() * 0xffffff)
                      .toString(16)
                      .padStart(6, "0")
          });
        }
      });
      return updated;
    });
  });

    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message])
    });
    
    socket.on("room_message", (data) => {
      setPrivateMessages((prev) => [...prev, data]);
    });


    return () => {
      socket.off("users");
      socket.off("message");
      socket.off("room_message");
      socket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if(name.trim()) {
      socket.emit("join", name);
      setJoined(true);
      setColors((colors) => [...colors, {name: name, color: (Math.random()*1000000).toFixed()}]);
    }
  };

  const handleMessage = () => {
    if(message.trim()) {
      socket.emit("message", {message, name});
      setMessage("");
    }
  }

  const handleMessageRoom = (room) => {
    if (message.trim()) {
      socket.emit("private_message", { room, message, name });
      setMessage("");
    }
  };


  if(!joined) {
    return (
      <div className='name-input-container'>
        <div className='name-input-content'>
          <span className='name-input-text'>Digite seu nome:</span>
          <input className='name-input' value={name} onChange={(e) => {setName(e.target.value)}}/>
          <button className='name-input-button' onClick={() => {handleJoin()}}>Entrar</button>
        </div>
      </div>
    )
  };


  return (
    <div className='container'>
      <div className='back-ground'></div>
      <div className='chat-container'>
        <div className='chat-contacts'>
          <div className='chat-options'></div>

          <div className='chat-item'>
            <img src={Image} alt='' className='image-profile'/>
            <div className='title-chat-container'>
              <span className='title-message'>Networking Profissão Programador</span>
              <span className='last-message'>
                {messages.length? `${messages[messages.length - 1].name}: ${messages[messages.length - 1].message}` : ''}
              </span>
            </div>
          </div>

          {Array.isArray(chats) && chats.map((item) => (
              <div className='chat-item'>
                <h1 className='letter-profile'>{item.you.charAt(0)}</h1>
                <div className='title-chat-container'>
                  <span className='title-message'>{item.you}</span>
                  <span className='last-message'>
                    {privateMessages.length? `${privateMessages[privateMessages.length - 1].name}: ${privateMessages[privateMessages.length - 1].message}` : ''}
                  </span>
                </div>
              </div>
            ))}
        </div>

        <div className='chat-messages'>
          <div className='chat-options'>
            <div className='chat-item'>
              <img src={Image} alt='' className='image-profile-top'/>
              <div className='title-chat-container'>
                <span className='title-message2'>Networking Profissão Programador</span>
                <span className='group-users'>
                  {users.map((user, index) => (
                    <span key={index}>
                      {user.name}{(index + 1 < users.length)? ', ': ''}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>

          <div className='chat-messages-area'>
            {messages.map((msg, index) => {
              const userColor = colors.find((c) => c.name === msg.name)?.color || "000000";

              return (
                <div
                  key={index}
                  className={
                    msg.name === name
                      ? "user-container-message right"
                      : "user-container-message left"
                  }
                >
                  {msg.name === name ? (
                    <UserMyMessage>{msg.message}</UserMyMessage>
                  ) : (
                    <UserOtherMessage>
                      <UserOtherMessageName 
                      color={userColor}
                      onClick=
                      {() => {

                        // Create a unique room ID using both names
                        const roomId = [name, msg.name].sort().join("-");
                        
                        // Tell server to join that room
                        socket.emit("join_room", roomId);
                        
                        // Switch active chat to that room
                        switchChat(roomId);
                        
                        // Add to chat list if not already
                        setChats(prevChats => {
                          const chatsArray = Array.isArray(prevChats) ? prevChats : [];
                          const alreadyExists = chatsArray.find(c => c.you === msg.name);
                          return [
                            ...chatsArray,
                            ...(alreadyExists ? [] : [{ me: name, you: msg.name, room: roomId }])
                          ];
                        });
                        
                        }}>
                      
                        {msg.name ? `${msg.name}: ` : ""}
                      </UserOtherMessageName>
                      <span>{msg.message}</span>
                    </UserOtherMessage>
                  )}
                </div>
              );
            })}
          </div>

          <div className='chat-input-area'>
            <input
              className='chat-input'
              placeholder='Mensagem'
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              onKeyDown={(e)=>{ if(e.key === "Enter") {activeChat? handleMessageRoom(activeChat) : handleMessage()} }}
            />
            <img
            src={SendMessageIcon} 
            alt='' 
            className='send-message-icon' 
            onClick={()=>{activeChat? handleMessageRoom(activeChat) : handleMessage()}}/>
          </div>
        </div>



      </div>
    </div>
  );
}

export default App;
