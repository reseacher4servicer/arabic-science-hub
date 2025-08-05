import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => {
    const classes = `rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`;
    return <div className={classes} ref={ref} {...props} />;
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", ...props }, ref) => {
    const classes = `flex flex-col space-y-1.5 p-6 ${className}`;
    return <div className={classes} ref={ref} {...props} />;
  }
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className = "", ...props }, ref) => {
    const classes = `text-2xl font-semibold leading-none tracking-tight ${className}`;
    return <h3 className={classes} ref={ref} {...props} />;
  }
);

CardTitle.displayName = "CardTitle";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", ...props }, ref) => {
    const classes = `p-6 pt-0 ${className}`;
    return <div className={classes} ref={ref} {...props} />;
  }
);

CardContent.displayName = "CardContent";

