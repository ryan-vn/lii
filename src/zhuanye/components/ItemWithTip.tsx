import React from "react";
import "./ItemWithTip.scss";

const ItemWithTip = ({ tip, color, children }) => {
  return (
    <div className="item-with-tip">
      {children}
      <div className="tip" style={{ color }}>
        {tip}
      </div>
    </div>
  );
};

export default ItemWithTip;
