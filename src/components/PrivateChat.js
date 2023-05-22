/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import firebaseConfig from "../firebaseConfig";

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const PrivateChat = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Retrieve the currently logged-in user
  const currentUser = firebase.auth().currentUser;
  const userID = currentUser?.email.split("@")[0];

  useEffect(() => {
    const messagesRef = firebase.database().ref("privateMessages");
    const currentUserQuery = messagesRef.orderByChild("senderId").equalTo(userID);
    const recipientUserQuery = messagesRef.orderByChild("recipientId").equalTo(userID);

    currentUserQuery.on("value", (snapshot) => {
      const currentUserMessages = snapshot.val();
      recipientUserQuery.on("value", (snapshot) => {
        const recipientUserMessages = snapshot.val();

        const currentUserMessageList = currentUserMessages ? Object.values(currentUserMessages) : [];
        const recipientUserMessageList = recipientUserMessages ? Object.values(recipientUserMessages) : [];

        const allMessages = [...currentUserMessageList, ...recipientUserMessageList];
        const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sortedMessages);
      });
    });

    return () => {
      currentUserQuery.off(); // Unsubscribe from the current user query
      recipientUserQuery.off(); // Unsubscribe from the recipient user query
    };
  }, [userId, userID]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const messagesRef = firebase.database().ref("privateMessages");
      messagesRef.push({
        senderId: userID,
        recipientId: userId,
        text: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
      setMessage("");
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2>Private Chat</h2>
        <p>Chatting with user ID: {userId}</p>
      </div>

      {/* Rest of your private chat UI */}

      <div className="text-center">
        {messages.map((msg) => (
          <p key={msg.timestamp}>
            <span className="sender">{msg.senderId === userID ? "me" : msg.senderId}:</span> {msg.text}
          </p>
        ))}
      </div>

      <div className="text-center">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={handleSendMessage}>Send Message</button>
      </div>
    </div>
  );
};

export default PrivateChat;
