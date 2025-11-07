// components/Button.js
import React from 'react';
import styles from './Button.module.css';

const Button = ({
    children,
    onClick,
    variant = 'default', // 'default', 'primary', 'tab'
    active = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const getButtonClass = () => {
        let baseClass = styles.button;

        if (variant === 'primary') {
            baseClass += ` ${styles.primaryButton}`;
        } else if (variant === 'tab') {
            baseClass = `${styles.tab} ${active ? styles.activeTab : ''}`;
        }

        return `${baseClass} ${className}`;
    };

    return (
        <button
            className={getButtonClass()}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;