import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-[#FDFBF7]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
        
        {}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex -space-x-2">
            <div className="relative z-10 flex h-10 w-10 items-center justify-center border-4 border-black bg-[#FF6B6B] font-sans text-xl font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              B
            </div>
            <div className="relative z-0 flex h-10 w-10 items-center justify-center border-4 border-black bg-[#4ECDC4] font-sans text-xl font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              V
            </div>
          </div>
          {}
          <Link to="/" className="hidden font-sans text-2xl font-black uppercase tracking-tighter text-black transition-transform hover:-translate-y-1 sm:block md:text-3xl">
            Biblioteca Virtual
          </Link>
        </div>

        {}
        <nav className="flex items-center gap-2 md:gap-6">
          <Link 
            to="/" 
            className={`flex items-center justify-center border-4 border-black px-4 py-2 font-sans text-xs font-black uppercase tracking-wider transition-all md:px-6 md:text-sm ${
              location.pathname === '/' 
                ? 'bg-[#FFE66D] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' 
                : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE66D] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
            }`}
          >
            Descobrir
          </Link>
          
          <Link 
            to="/profile" 
            className={`flex items-center justify-center border-4 border-black px-4 py-2 font-sans text-xs font-black uppercase tracking-wider transition-all md:px-6 md:text-sm ${
              location.pathname === '/profile' 
                ? 'bg-[#A06CD5] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' 
                : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#A06CD5] hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
            }`}
          >
            Estante
          </Link>
        </nav>
        
      </div>
    </header>
  );
}