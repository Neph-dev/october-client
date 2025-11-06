import MenuItem from '../menuItem';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed md:relative top-0 left-0 z-50 md:z-auto
                w-64 bg-linear-to-b from-gray-900 to-black p-4 md:p-6 
                flex flex-col min-h-screen md:min-h-auto
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <button
                    onClick={onClose}
                    className="md:hidden absolute top-4 right-4 text-white hover:text-gray-300"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h1 className="text-xl md:text-2xl font-bold mb-8 md:mb-12 px-6 text-white">octob3r</h1>

                <div className="space-y-2 mb-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-4">Watchlist</p>
                    <MenuItem onClose={onClose} />
                </div>
            </div>
        </>
    );
};

export default Sidebar;