import axios from "axios";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { UserContext } from "../../../Context/AuthContext/AuthContext";
import { UserChatsId } from "../../../Context/ChatsContext/ChatsContext";

export default function Login() {
  const { setUserId, setUserEmail, setUserName } = useContext(UserContext);
  const { setUserChatsId } = useContext(UserChatsId);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await axios.post(
        "https://aiservice.magacademy.co/v2/signin",
        data,
      );

      const user = response.data.user;
      const chats = response.data.chats || [];

      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem("userId", user.user_id);
      localStorage.setItem("userEmail", user.user_email);
      localStorage.setItem("userName", user.user_name);

      // حفظ الشاتس في localStorage مباشرة
      localStorage.setItem("userChatsId", JSON.stringify(chats));

      // تحديث Contexts
      setUserId(user.user_id);
      setUserEmail(user.user_email);
      setUserName(user.user_name);
      setUserChatsId(chats);

      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="auth-container">
      <div className="container-fluid bg-overlay">
        <div className="row vh-100 justify-content-center align-items-center">
          <div className="col-sm-12 col-md-8 col-lg-7 col-xl-5 p-4 rounded-2 form-bg">
            <div className="form-container">
              <div className="logo-container banner text-center">
                <img className="w-25" src={logo} alt="" />
              </div>

              <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <input
                    {...register("user_email", {
                      required: "Email is required",
                    })}
                    type="email"
                    className="form-control"
                    placeholder="Enter your E-mail"
                  />
                </div>

                <div className="links d-flex justify-content-between">
                  <Link
                    className="text-decoration-none link-style"
                    to={"/register"}
                  >
                    Register Now?
                  </Link>
                  <Link
                    className="text-decoration-none link-style"
                    to={"/forget-pass"}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <button className="w-100 m-auto d-block mt-3 login-btn-style">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
