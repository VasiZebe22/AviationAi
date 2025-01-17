import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTime = 0) => {
    const [timer, setTimer] = useState(initialTime);

    useEffect(() => {
        setTimer(initialTime);
    }, [initialTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = useCallback((seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, []);

    return {
        timer,
        formatTime
    };
};

export default useTimer;
