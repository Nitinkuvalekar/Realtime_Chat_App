/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import firebaseConfig from "./firebaseConfig";
import SignIn from "./components/SignIn";
import ChatRooms from "./components/ChatRooms";
import ChatRoomPage from "./components/ChatRoomPage";
import PrivateChat from "./components/PrivateChat";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from "react-router-dom";

firebase.initializeApp(firebaseConfig);

const App = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <nav className="navbar" style={{ backgroundColor: "lightblue", padding: "10px" }}>
        <div className="navbar-title">
          <h3>Chat Rooms</h3>
        </div>
        <div className="navbar-buttons">
          <Link to="/" className="navbar-button p-3">
            Home
          </Link>
          {user && (
            <button onClick={handleLogout} className="btn btn-primary">
              Logout
            </button>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={user ? <ChatRooms /> : <SignIn />} />
        <Route path="/chatRoom/:id" element={<ChatRoomPage />} />
        <Route path="/privateChat/:userId" element={<PrivateChat />} />
      </Routes>
    </div>
  );
};

export default App;
