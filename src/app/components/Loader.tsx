// Loader component - displays Payment Processing animation
import { useEffect, useRef } from 'react';

// Props interface for Loader component
interface LoaderProps {
  size?: number; // Size of the loader (default: 200)
  className?: string; // Additional CSS classes
  fullScreen?: boolean; // Whether to show as full screen loader
}

// Loader component using Lottie animation
export function Loader({ size = 250, className = '', fullScreen = false }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationInstance: any = null;

    const loadLottie = async () => {
      try {
        // Dynamically import lottie-web to avoid SSR issues
        const lottie = (await import('lottie-web')).default;
        
        // Import the animation data
        const animationData = await import('../../assets/Payment Processing.json');
        
        if (containerRef.current) {
          animationInstance = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData.default,
          });
        }
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    loadLottie();

    // Cleanup function
    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
    };
  }, []);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div 
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <div 
              ref={containerRef}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <div 
          className={`mx-auto ${className}`}
          style={{ width: size, height: size }}
        >
          <div 
            ref={containerRef}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <p className="mt-4 text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
}