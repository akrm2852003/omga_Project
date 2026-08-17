import axios from "axios";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { UserContext } from "../../../Context/AuthContext/AuthContext";
import { UserChatsId } from "../../../Context/ChatsContext/ChatsContext";
import AuthCard from "../../../SharedModule/AuthCard/AuthCard";

export default function Login() {
  const { setUserId, setUserEmail, setUserName } = useContext(UserContext);
  const { setUserChatsId } = useContext(UserChatsId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  async function onSubmit(data) {
    setFormError("");
    setLoading(true);
    try {
      const response = await axios.post(
        "https://aiservice.magacademy.co/v2/signin",
        data,
      );

      const user = response.data.user;
      const chats = response.data.chats || [];

      localStorage.setItem("userId", user.user_id);
      localStorage.setItem("userEmail", user.user_email);
      localStorage.setItem("userName", user.user_name);
      localStorage.setItem("userChatsId", JSON.stringify(chats));

      setUserId(user.user_id);
      setUserEmail(user.user_email);
      setUserName(user.user_name);
      setUserChatsId(chats);

      navigate("/home");
    } catch (error) {
      console.log(error);
      if (error.response?.status === 404) {
        setFormError("مفيش حساب بالإيميل ده — سجّل حساب جديد الأول.");
      } else {
        setFormError("حصلت مشكلة في الاتصال، حاول تاني.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="أهلاً بيك تاني"
      subtitle="سجّل دخولك بإيميلك عشان تكمل مذاكرتك"
      footer={
        <>
          لسه معملتش حساب؟ <Link to="/register">سجّل دلوقتي</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <div className="form-alert error">
            <FiAlertCircle size={16} />
            {formError}
          </div>
        )}

        <div className="field">
          <label htmlFor="user_email">البريد الإلكتروني</label>
          <div className="field-input-wrap">
            <FiMail size={16} />
            <input
              id="user_email"
              type="email"
              placeholder="example@mail.com"
              {...register("user_email", { required: "البريد الإلكتروني مطلوب" })}
            />
          </div>
          {errors.user_email && <div className="field-error">{errors.user_email.message}</div>}
        </div>

        <motion.button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? <span className="btn-spinner" /> : "دخول"}
        </motion.button>
      </form>
    </AuthCard>
  );
}
