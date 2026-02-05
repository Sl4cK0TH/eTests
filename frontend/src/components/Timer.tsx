import { useState, useEffect } from 'react';

interface TimerProps {
    expiresAt: Date;
    onExpire: () => void;
}

export default function Timer({ expiresAt, onExpire }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const diff = expiresAt.getTime() - Date.now();
        if (diff <= 0) return 0;
        return Math.floor(diff / 1000);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                onExpire();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const getTimerClass = () => {
        if (timeLeft <= 60) return 'timer danger';
        if (timeLeft <= 300) return 'timer warning';
        return 'timer';
    };

    return (
        <div className={getTimerClass()}>
            ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
}
