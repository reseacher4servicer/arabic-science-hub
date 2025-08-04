import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    const classes = `flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;
    
    return (
      <select className={classes} ref={ref} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export const SelectTrigger = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const SelectContent = ({ children }: any) => children;

export const SelectItem = ({ value, children }: any) => (
  <option value={value}>{children}</option>
);

export const SelectValue = ({ placeholder }: any) => (
  <option value="" disabled>{placeholder}</option>
);

