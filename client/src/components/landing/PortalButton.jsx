import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import PortalOverlay from './PortalOverlay';
import { cn } from '../../lib/utils';

const VARIANTS = {
  brand: 'brand-btn',
  light:
    'inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-primary-700 shadow-elevated transition-all duration-300 hover:bg-slate-50 hover:shadow-glow-cyan',
};

function PortalButton({ children = 'Enter Patient Portal', className, href, variant = 'brand', as: As = 'button' }) {
  const [entering, setEntering] = useState(false);
  const [origin, setOrigin] = useState(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleClick = (e) => {
    setOrigin({ x: e.clientX, y: e.clientY });
    setEntering(true);
  };

  const handleComplete = () => {
    setEntering(false);
    navigate(href ?? (user ? '/dashboard' : '/register'));
  };

  return (
    <>
      <As
        type={As === 'button' ? 'button' : undefined}
        onClick={handleClick}
        className={cn(VARIANTS[variant] ?? VARIANTS.brand, className)}
      >
        {children}
      </As>
      <PortalOverlay active={entering} origin={origin} onComplete={handleComplete} />
    </>
  );
}

export default PortalButton;
