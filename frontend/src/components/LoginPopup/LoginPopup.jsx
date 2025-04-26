import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

let otpsent = "";
// declared this outside so that the generated otp is not reset on every render
// and is accessible in the onLogin function

const LoginPopup = ({ setShowLogin }) => {
  const { setToken, url, loadCartData } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign Up");
  const [invalidOtpCount, setInvalidOtpCount] = useState(0);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();

    let new_url = url;
    // login state
    if (currState === "Login") {
      new_url += "/api/user/login";
    } else if (currState === "Sign Up") { // sign up state
      setInvalidOtpCount(0); // reset invalid otp count before moving to otp verification page
      setCurrState("Verify Email");

      // execution waits for the axios call to finish as it is await
      // in this time react simply re renders the page and the currState is updated to "Verify Email"
      // so the user will the verify page before the otp is sent
      
      // api call to send mail
      let apiurl = `${url}/api/user/sendOtpMail`;
      let otpresponse = await axios.post(apiurl, {
        email: data.email,
      });

      if (otpresponse.data.success) {
        toast.success(`OTP sent to ${data.email}`);
        otpsent = otpresponse.data.otp;
      } else {
        toast.error(otpresponse.data.message);
        return;
      }
      return;
    } else {
      // verify email state (if verified then register the user)
      if (data.otp != otpsent) {
        setInvalidOtpCount((invalidOtpCount) => invalidOtpCount + 1);
        toast.error("Invalid OTP");
        if (invalidOtpCount >= 2) {
          toast.error("Too many invalid attempts. Please try again later.");
          setCurrState("Sign Up");
        }
        return;
      } else {
        toast.success("OTP verified successfully");
        new_url += "/api/user/register";
      }
    }
    // make api calls to backend for login and register
    const response = await axios.post(new_url, data);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        loadCartData({ token: response.data.token });
        setShowLogin(false);
      } else {
        toast.error(response.data.message);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>{" "}
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>
        {currState !== "Verify Email" ? (
          <div className="login-popup-inputs">
            {currState === "Sign Up" ? (
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Your name"
                required
              />
            ) : (
              <></>
            )}
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Your email"
            />
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder="Password"
              required
            />
          </div>
        ) : (
          <div className="login-popup-inputs">
            <input
              name="otp"
              onChange={onChangeHandler}
              value={data.otp}
              type="text"
              placeholder="Enter otp sent to your mail"
              required
            />
          </div>
        )}

        <button>
          {currState === "Login"
            ? "Login"
            : currState === "Sign Up"
            ? "Sign Up"
            : "Verify Email"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" name="" id="" required />
          <p>By continuing, i agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : currState === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
