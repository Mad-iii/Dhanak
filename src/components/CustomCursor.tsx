import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

export const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    const springConfig = { damping: 25, stiffness: 150 };
    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('a') || 
                target.closest('button') ||
                target.classList.contains('cursor-pointer')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[10000] hidden lg:block">
            {/* Inner Dot */}
            <motion.div
                className="fixed w-2 h-2 bg-brand-magenta rounded-full mix-blend-multiply"
                style={{
                    left: mousePosition.x - 4,
                    top: mousePosition.y - 4,
                }}
            />
            
            {/* Outer Circle */}
            <motion.div
                className="fixed w-8 h-8 border-2 border-brand-black rounded-full"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(255, 0, 128, 0.1)' : 'rgba(255, 255, 255, 0)',
                    borderColor: isHovering ? '#FF0080' : '#1A0A00',
                    borderWidth: isHovering ? '1px' : '2px',
                }}
                transition={{ duration: 0.2 }}
            />

            {/* Ritual Aura (Pulse) */}
            {isHovering && (
                <motion.div
                    className="fixed w-12 h-12 border border-brand-magenta rounded-full opacity-20"
                    style={{
                        left: mousePosition.x - 24,
                        top: mousePosition.y - 24,
                    }}
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0, 0.2]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
        </div>
    );
};
