import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AuthCard from "../../../SharedModule/AuthCard/AuthCard";

export default function Register() {
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
      await axios.post("https://aiservice.magacademy.co/v2/signup", data);
      toast.success("تم إنشاء الحساب بنجاح! سجّل دخولك دلوقتي.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      setFormError("حصلت مشكلة في إنشاء الحساب، حاول تاني.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="ابدأ مذاكرتك دلوقتي"
      subtitle="اعمل حساب جديد في أقل من دقيقة"
      footer={
        <>
          عندك حساب بالفعل؟ <Link to="/login">سجّل دخولك</Link>
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
          <label htmlFor="user_name">الاسم</label>
          <div className="field-input-wrap">
            <FiUser size={16} />
            <input
              id="user_name"
              type="text"
              placeholder="اسمك الكامل"
              {...register("user_name", { required: "الاسم مطلوب" })}
            />
          </div>
          {errors.user_name && <div className="field-error">{errors.user_name.message}</div>}
        </div>

        <div className="field">
          <label htmlFor="user_email">البريد الإلكتروني</label>
          <div className="field-input-wrap">
            <FiMail size={16} />
            <input
              id="user_email"
              type="email"
              placeholder="example@mail.com"
              {...register("user_email", {
                required: "البريد الإلكتروني مطلوب",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "لازم يكون بريد إلكتروني صحيح",
                },
              })}
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
          {loading ? <span className="btn-spinner" /> : "إنشاء الحساب"}
        </motion.button>
      </form>
    </AuthCard>
  );
}
