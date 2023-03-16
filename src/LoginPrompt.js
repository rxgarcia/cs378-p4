import * as React from "react";
import { useEffect, useState } from "react";

const LoginPrompt = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="loginContainer">
      <p className="loginPrompt">Login to Account</p>
      <input
        className="inputCity"
        type="text"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="inputCity"
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="searchButton" onClick={() => props.handleLogin(email, password)}>Login</button>
    </div>
  );
};

export default LoginPrompt;
