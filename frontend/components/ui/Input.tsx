import React from "react";
import { FieldError } from "./FieldError";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1.5";

const inputBaseCls =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4]";

const inputErrCls =
  "border-[#c8102e] focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.1)]";

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div>
        {label && <label className={labelCls}>{label}</label>}

        <input
            {...props}
            className={`${inputBaseCls} ${error ? inputErrCls : ""} ${className}`}
        />
            
        <FieldError message={error} />
    </div>
  );
};

export default Input;