
interface LogoProps {
    collapsed?: boolean;
    className?: string;
}

export default function Logo({ collapsed = false, className = '' }: LogoProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {/* The Logo Icon container */}
            <div className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#272877] via-[#3a3ca6] to-[#5154bd] shadow-lg shadow-[#272877]/30 hover:scale-105 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Isometric Box / Stack to represent Inventory and Store */}
                    {/* Top Face */}
                    <path d="M12 2.5L2.5 7.5L12 12.5L21.5 7.5L12 2.5Z" fill="white" fillOpacity="0.95"/>
                    {/* Left Face */}
                    <path d="M2.5 7.5V16L12 21V12.5L2.5 7.5Z" fill="white" fillOpacity="0.65"/>
                    {/* Right Face */}
                    <path d="M21.5 7.5V16L12 21V12.5L21.5 7.5Z" fill="white" fillOpacity="0.35"/>
                    {/* Accent glowing lines */}
                    <path d="M12 2.5L2.5 7.5L12 12.5L21.5 7.5L12 2.5Z" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M12 12.5V21" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
            </div>

            {/* The Text Mark */}
            {!collapsed && (
                <div className="flex flex-col justify-center animate-fade-in pl-2">
                    <span className="text-xl font-black leading-tight tracking-tight text-gray-900 dark:text-gray-100 whitespace-nowrap text-left transition-colors">
                        Inventory<br />
                        <span className="text-[#272877] dark:text-[#6e6fe4] transition-colors">Management</span>
                    </span>
                </div>
            )}
        </div>
    );
}
