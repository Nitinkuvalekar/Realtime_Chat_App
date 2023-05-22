/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const ChatRoomPage = () => {
  const { id } = useParams(); // Retrieve the room ID from the URL parameter
  const [roomData, setRoomData] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Retrieve the currently logged-in user
  const currentUser = firebase.auth().currentUser;
  const userID = currentUser?.email.split("@")[0];

  useEffect(() => {
    const roomRef = firebase.database().ref(`chatRooms/${id}`);

    roomRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setRoomData(data);
      setMessages(data?.messages ? Object.values(data.messages) : []);
    });

    return () => {
      roomRef.off(); // Unsubscribe from the room updates
    };
  }, [id]);

  const handleSendMessage = (id) => {
    if (message.trim() !== "") {
      const roomRef = firebase.database().ref(`chatRooms/${id}`);
      const messagesRef = roomRef.child("messages");
      const newMessageRef = messagesRef.push();
      newMessageRef.set({
        text: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        userId: userID,
      });
      setMessage("");
    }
  };

  useEffect(() => {
    if (currentUser) {
      const roomRef = firebase.database().ref(`chatRooms/${id}`);
      const usersRef = roomRef.child("users");

      // Check if the user already exists in the user list
      const checkUserExists = () => {
        return new Promise((resolve) => {
          usersRef.once("value", (snapshot) => {
            const users = snapshot.val();
            const userList = users ? Object.values(users) : [];
            const userExists = userList.some((user) => user.id === currentUser.id);

            resolve(userExists);
          });
        });
      };

      checkUserExists().then((userExists) => {
        if (!userExists) {
          usersRef.push(userID);
        }
      });
    }
  }, [id]);

  return (
    <div>
      <div className="text-center">
        <h2>{roomData?.name || "Loading room data..."}</h2>
      </div>

      <div className="row">
        <div className="col-lg-4">
          <h3>Users:</h3>
          <ul className="list-group">
            {roomData?.users &&
              Object.entries(roomData.users).map(([userId, username]) => (
                <li key={userId} className="list-group-item">
                  {username === userID ? "me" : username}
                  {username === userID ? (
                    ""
                  ) : (
                    <Link to={`/privateChat/${username}`} className="btn btn-primary">
                      Send Message
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </div>

        <div className="col-lg-8">
          <div className="text-left" style={{ marginLeft: '190px' }}>
            <h3>Chat Messages:</h3>
            {messages.map((msg) => (
              <p key={msg.id}>
                <span className="user-id">{msg.userId === userID ? "me" : msg.userId}:</span> {msg.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={() => handleSendMessage(id)}>Send</button>
      </div>

      <Link to="/">
        <button className="btn btn-primary mt-4">Leave Room</button>
      </Link>
    </div>
  );
};

export default ChatRoomPage;
