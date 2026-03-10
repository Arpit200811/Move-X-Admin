import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Context ─────────────────────────────────────────────────────────
const DropdownContext = createContext(null);

// ── Root ─────────────────────────────────────────────────────────────
export function DropdownMenu({ children }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div ref={ref} className="relative inline-block">
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

// ── Trigger ───────────────────────────────────────────────────────────
export function DropdownMenuTrigger({ children, asChild = false }) {
    const { open, setOpen } = useContext(DropdownContext);

    const handleClick = () => setOpen(prev => !prev);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: handleClick,
            'aria-expanded': open,
            'aria-haspopup': true,
        });
    }

    return (
        <button
            onClick={handleClick}
            aria-expanded={open}
            aria-haspopup={true}
            className="outline-none"
        >
            {children}
        </button>
    );
}

// ── Content ───────────────────────────────────────────────────────────
export function DropdownMenuContent({ children, align = 'start', className = '' }) {
    const { open, setOpen } = useContext(DropdownContext);

    const alignClass = align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={`absolute z-50 mt-2 min-w-40 ${alignClass}
                        bg-white rounded-2xl shadow-xl shadow-slate-900/10 
                        border border-slate-100 p-1.5 ${className}`}
                    role="menu"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Item ─────────────────────────────────────────────────────────────
export function DropdownMenuItem({ children, onClick, className = '', disabled = false }) {
    const { setOpen } = useContext(DropdownContext);

    const handleClick = () => {
        if (disabled) return;
        onClick?.();
        setOpen(false);
    };

    return (
        <button
            role="menuitem"
            disabled={disabled}
            onClick={handleClick}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 
                rounded-xl text-left transition-all 
                hover:bg-slate-50 hover:text-slate-900
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}`}
        >
            {children}
        </button>
    );
}

// ── Label ─────────────────────────────────────────────────────────────
export function DropdownMenuLabel({ children, className = '' }) {
    return (
        <p className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 ${className}`}>
            {children}
        </p>
    );
}

// ── Separator ─────────────────────────────────────────────────────────
export function DropdownMenuSeparator({ className = '' }) {
    return <div className={`my-1 h-px bg-slate-100 ${className}`} />;
}

// ── Sub components grouped for convenience ─────────────────────────────
DropdownMenu.Trigger = DropdownMenuTrigger;
DropdownMenu.Content = DropdownMenuContent;
DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Label = DropdownMenuLabel;
DropdownMenu.Separator = DropdownMenuSeparator;
