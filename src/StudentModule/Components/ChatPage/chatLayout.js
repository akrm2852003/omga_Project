import React from "react";
import formatMessage from "./chatFormatter";
import "./chatLayout.css"; // ملف CSS اللي هنعمله تحت

const Chat = ({ messages }) => {
    return ( <
        div className = "chat-wrapper" >
        <
        div className = "chat-main" > { /* Message List */ } <
        div className = "chat-message-list" > {
            messages.map((msg, idx) => ( <
                div key = { idx }
                className = "custom-message-content"
                dangerouslySetInnerHTML = {
                    { __html: formatMessage(msg.text) } }
                />
            ))
        } <
        /div>

        { /* Input */ } <
        div className = "cs-message-input" >
        <
        input type = "text"
        placeholder = "اكتب رسالتك هنا..."
        style = {
            {
                width: "100%",
                padding: "12px",
                border: "none",
                outline: "none",
                fontSize: "1rem",
            }
        }
        /> <
        /div> <
        /div> <
        /div>
    );
};

export default Chat;