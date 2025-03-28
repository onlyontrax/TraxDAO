import React, { ReactNode } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { CircleCheck } from 'lucide-react';

export interface TraxButtonProps {
  htmlType: "submit" | "reset" | "button";
  styleType: "primary" | "secondary" | "white" | "side" | "picture" | "icon" | "alert" | "settings" | "play" | "signin" | "primaryPerformer" | "secondaryPerformer" | "facebook";
  buttonSize?: "small" | "medium" | "large" | "full" | "auth";
  buttonPosition?: "start" | "center" | "end" | "between" | "around" | "evenly" | "stretch";
  buttonText?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  style?: React.CSSProperties;
  isActive?: boolean;
  color?: string;
}
export default function TraxButton({ htmlType, styleType, buttonSize, buttonPosition, buttonText, disabled, loading, onClick, icon, isActive, color }: TraxButtonProps) {

  const buttonStyles = {
    primary: "trax-button primary",
    secondary: "trax-button secondary",
    white: "trax-button white",
    side: "trax-button side primary",
    picture: "trax-button picture-b",
    icon: "trax-button icon-b",
    alert: "trax-button alert-b",
    auth: "trax-button picture-b",
    settings: "trax-button settings-b",
    play: "trax-button play-b",
    signin: "trax-button signin-b",
    primaryPerformer: "trax-button primary-performer",
    secondaryPerformer: "trax-button secondary-performer",
    facebook: "trax-button picture-b bg-[#1877F2] text-trax-white",
    
  };

  const buttonSizes = {
    small: "b-size-sm",
    medium: "b-size-base",
    large: "b-size-xl",
    full: "b-size-full",
    auth: "b-size-auth"
  };

  const buttonPositions = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
    stretch: "justify-stretch"
  };

  const className = `${buttonStyles[styleType]} ${buttonPositions[buttonPosition]} ${buttonSizes[buttonSize]} ${isActive ? 'active' : ''}`;

  return (
    <button
      type={htmlType}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={{ '--theme-color': color || '#A8FF00' } as React.CSSProperties}
    >
      {isActive && (
        <span className="button-icon">
          <CircleCheck className='w-6 h-6' />
        </span>
      )}
      {!isActive && icon && <span className="button-icon mr-0">{icon}</span>}
      <span>{loading ? 'Loading...' : buttonText || ''}</span>
    </button>
  );
};