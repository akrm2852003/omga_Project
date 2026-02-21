import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";

export default function Register() {
  let {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  let navigate = useNavigate();

  async function onSubmit(data) {
    console.log(data);

    try {
      let response = await axios.post(
        "https://aiservice.magacademy.co/v2/signup",
        data,
      );
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <div className="auth-container ">
        <div className="container-fluid bg-overlay ">
          <div className="row vh-100 justify-content-center align-items-center">
            <div className=" col-sm-12 col-md-8 col-lg-7 col-xl-5  p-4 rounded-2 form-bg">
              <div className="form-container  ">
                <div className="logo-container banner text-center">
                  <img className="w-25" src={logo} alt="" />
                </div>

                <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                  <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">
                      <i class="fa-solid fa-circle-user fa-beat-fade"></i>
                    </span>
                    <input
                      {...register("user_name", {
                        required: "userName is required",
                      })}
                      type="userName"
                      className="form-control"
                      placeholder="Enter User Name"
                      aria-label="userName"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                  {errors.userName && (
                    <div className="alert alert-danger p-2">
                      {errors.userName.message}
                    </div>
                  )}

                  <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">
                      <i class="fa-solid fa-envelope fa-beat-fade"></i>
                    </span>
                    <input
                      {...register("user_email", {
                        required: "email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "should be valid mail",
                        },
                      })}
                      type="email"
                      className="form-control"
                      placeholder="Enter your E-mail"
                      aria-label="email"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                  {errors.email && (
                    <div className="alert alert-danger p-2 ">
                      {errors.email.message}
                    </div>
                  )}

                  <div className="links d-flex justify-content-end">
                    <Link
                      className=" text-decoration-none link-style"
                      to={"/login"}
                    >
                      Login Now
                    </Link>
                  </div>
                  <button className=" w-100 m-auto d-block mt-3 login-btn-style ">
                    Register
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
