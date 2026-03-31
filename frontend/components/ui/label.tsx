import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1.5";

const Label: React.FC<LabelProps> = ({ children, className = "", ...props }) => {
  return (
    <label className={`${labelCls} ${className}`} {...props}>
      {children}
    </label>
  );
};

export default Label;