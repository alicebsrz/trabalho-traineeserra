export function Footer() {
  return (
    <footer className="mt-auto border-t-8 border-black bg-[#FDFBF7]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row">
        
        {}
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center border-4 border-black bg-black font-sans text-xl font-black text-white shadow-[4px_4px_0px_0px_rgba(78,205,196,1)]">
            BV
          </span>
          <div className="flex flex-col">
            <span className="font-sans text-xl font-black uppercase tracking-tighter text-black">
              Biblioteca Virtual
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-zinc-500">
              O seu destino literário
            </span>
          </div>
        </div>

        {}
        <div className="text-center md:text-left">
          <p className="font-sans text-sm font-bold uppercase tracking-wider text-black">
            © {new Date().getFullYear()} Biblioteca Virtual.
          </p>
          <p className="mt-1 font-sans text-xs font-bold uppercase tracking-widest text-orange-600">
            Desenvolvido com 🖤 
          </p>
        </div>

        {}
        <div className="flex gap-3">
          <div className="h-6 w-6 border-4 border-black bg-[#FF6B6B] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"></div>
          <div className="h-6 w-6 border-4 border-black bg-[#FFE66D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"></div>
          <div className="h-6 w-6 border-4 border-black bg-[#A06CD5] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"></div>
        </div>

      </div>
    </footer>
  );
}