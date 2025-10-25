import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './icons';

const BackButton: React.FC<{ to?: string }> = ({ to }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary font-semibold mb-4"
        >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
        </button>
    );
};

export default BackButton;
