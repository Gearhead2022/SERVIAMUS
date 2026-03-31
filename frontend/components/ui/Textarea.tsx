import React from "react";
import { FieldError } from "./FieldError";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1.5";

const textareaBaseCls =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white placeholder:text-[#b0bcd4] resize-none";

const textareaErrCls =
  "border-[#c8102e] focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.1)]";

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}

      <textarea
        {...props}
        className={`${textareaBaseCls} ${
          error ? textareaErrCls : ""
        } ${className}`}
      />

      <FieldError message={error} />
    </div>
  );
};

export default Textarea;