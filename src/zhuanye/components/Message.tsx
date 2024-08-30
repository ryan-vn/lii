import React from "react";
import "./Message.scss";
import react, { useEffect, useState } from "react";

// info error success
const Message = ({ content, type = "info", duration = 2500 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShow(false);
    }, duration);
  }, []);

  return (
    <>
      {show ? (
        <div className={`comp-message ${type}`}>
          {type === "info" ? <div className="icon-info"></div> : null}
          {type === "error" ? <div className="icon-info"></div> : null}
          {type === "success" ? <div className="icon-info"></div> : null}
          <p className="message-content">{content}</p>
        </div>
      ) : null}
    </>
  );
};

export default Message;
