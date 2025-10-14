import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover/popover";
import "./dialog.scss";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      {children}
    </Popover>
  );
};

const DialogTrigger = PopoverTrigger;

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <PopoverContent
        ref={ref}
        portal={true}
        side="bottom"
        align="center"
        className={`dialog-content ${className || ""}`}
        {...props}
      >
        <div className="dialog-content-wrapper">{children}</div>
      </PopoverContent>
    );
  }
);

const DialogHeader: React.FC<DialogHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={`dialog-header ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h2 className={`dialog-title ${className || ""}`} {...props}>
      {children}
    </h2>
  );
};

DialogContent.displayName = "DialogContent";

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
