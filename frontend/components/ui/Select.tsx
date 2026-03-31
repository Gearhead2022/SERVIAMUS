import React from "react";
import { FieldError } from "./FieldError";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#6b7da0] mb-1.5";

const selectBaseCls =
  "w-full bg-[#f0f3fa] border border-[1.5px] border-[#dce3ef] rounded-lg px-3 py-2.5 text-sm text-[#1a2a45] font-['DM_Sans'] outline-none transition focus:border-[#1a3560] focus:shadow-[0_0_0_3px_rgba(26,53,96,0.1)] focus:bg-white appearance-none pr-9 bg-no-repeat bg-[right_14px_center]";

const selectErrCls =
  "border-[#c8102e] focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.1)]";

const arrowStyle =
  "bg-[image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7da0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")]";

const Select: React.FC<SelectProps> = ({
  label,
  error,
  className = "",
  children,
  ...props
}) => {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}

      <select
        {...props}
        className={`${selectBaseCls} ${arrowStyle} ${
          error ? selectErrCls : ""
        } ${className}`}
      >
        {children}
      </select>

      <FieldError message={error} />
    </div>
  );
};

export default Select;