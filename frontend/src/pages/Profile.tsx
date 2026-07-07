import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SavedBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: 'TO_READ' | 'READING' | 'FINISHED';
}

export function Profile() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Puxa os dados do usuário que salvamos no Login
  const userStr = localStorage.getItem('@BibliotecaVirtual:user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Leitor Misterioso' };
  
  // Pega as duas primeiras letras do nome para o Avatar
  const initials = user.name.substring(0, 2).toUpperCase();

  // Função central para buscar os livros na API
  const fetchBooks = async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem('@BibliotecaVirtual:token');
      const response = await fetch('http://localhost:3333/livros', {
        signal,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (signal?.aborted) return;
        setBooks(data);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error("Erro ao buscar livros:", error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchBooks(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // O Log-out: Apaga as chaves e manda pro Login
  const handleLogout = () => {
    localStorage.removeItem('@BibliotecaVirtual:token');
    localStorage.removeItem('@BibliotecaVirtual:user');
    navigate('/login');
  };

  // Muda a prateleira do livro
  const handleStatusChange = async (id: string, newStatus: SavedBook['status']) => {
    try {
      const token = localStorage.getItem('@BibliotecaVirtual:token');
      const response = await fetch(`http://localhost:3333/livros/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setBooks(books.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch {
      alert("Erro ao atualizar status");
    }
  };

  // Remove o livro da estante
  const handleDelete = async (id: string) => {
    if (!window.confirm("Certeza que deseja remover este livro da sua estante?")) return;
    
    try {
      const token = localStorage.getItem('@BibliotecaVirtual:token');
      const response = await fetch(`http://localhost:3333/livros/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setBooks(books.filter(b => b.id !== id));
      }
    } catch {
      alert("Erro ao deletar livro");
    }
  };

  const toRead = books.filter(b => b.status === 'TO_READ');
  const reading = books.filter(b => b.status === 'READING');
  const finished = books.filter(b => b.status === 'FINISHED');

  return (
    <div className="min-h-screen bg-[#FDFBF7] bg-noise p-6 md:p-12">
      <header className="relative mb-24 flex flex-col items-center justify-center text-center">
        
        {}
        <button 
          onClick={handleLogout}
          className="absolute right-0 top-0 border-4 border-black bg-white px-4 py-2 font-sans text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:bg-[#FF6B6B] hover:text-white"
        >
          Sair
        </button>

        <div className="mb-6 flex h-28 w-28 -rotate-6 items-center justify-center border-4 border-black bg-[#A06CD5] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:rotate-0">
          <span className="font-sans text-5xl font-black text-white">{initials}</span>
        </div>
        <h2 className="font-sans text-5xl font-black uppercase tracking-tighter text-black md:text-6xl">{user.name}</h2>
        <span className="mt-4 inline-block border-2 border-black bg-white px-4 py-1 font-sans text-sm font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Santuário Literário
        </span>
      </header>

      {loading ? (
        <div className="text-center font-sans text-xl font-bold">Carregando estante...</div>
      ) : books.length === 0 ? (
        <div className="text-center">
          <p className="font-sans text-xl font-bold">Sua estante está vazia.</p>
          <button onClick={() => navigate('/')} className="mt-4 border-4 border-black bg-[#FFE66D] px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1">
            Explorar Enigmas
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-24">
          <BookSection title="Lendo Atualmente" books={reading} badgeColor="bg-[#4ECDC4]" onChangeStatus={handleStatusChange} onDelete={handleDelete} />
          <BookSection title="Para Ler" books={toRead} badgeColor="bg-[#FFE66D]" onChangeStatus={handleStatusChange} onDelete={handleDelete} />
          <BookSection title="Concluídos" books={finished} badgeColor="bg-[#FF6B6B]" onChangeStatus={handleStatusChange} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}


function BookSection({ title, books, badgeColor, onChangeStatus, onDelete }: { 
  title: string; 
  books: SavedBook[]; 
  badgeColor: string;
  onChangeStatus: (id: string, status: SavedBook['status']) => void;
  onDelete: (id: string) => void;
}) {
  if (books.length === 0) return null;

  return (
    <section>
      <div className="mb-8 flex items-center gap-4">
        <h3 className={`inline-block border-4 border-black ${badgeColor} px-6 py-2 font-sans text-2xl font-black uppercase tracking-widest text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
          {title}
        </h3>
        <div className="h-2 flex-1 border-y-4 border-black bg-white"></div>
      </div>

      <div className="relative">
        <div className="flex w-full snap-x snap-mandatory items-end gap-8 overflow-x-auto border-b-8 border-black px-4 pb-0 pt-32
          [&::-webkit-scrollbar]:h-4 
          [&::-webkit-scrollbar-track]:border-t-4 [&::-webkit-scrollbar-track]:border-black [&::-webkit-scrollbar-track]:bg-[#FDFBF7] 
          [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-black [&::-webkit-scrollbar-thumb]:bg-black"
        >
          {books.map((book) => (
            <div key={book.id} className="group relative flex w-40 flex-none snap-start flex-col items-center justify-end">
              
              {}
              <div className="pointer-events-none absolute -top-28 left-1/2 z-20 w-56 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="border-4 border-black bg-white p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="line-clamp-2 font-sans text-xs font-black uppercase leading-tight text-black">{book.title}</h4>
                  
                  {}
                  <div className="mt-3 flex justify-center gap-2">
                    <button onClick={() => onChangeStatus(book.id, 'TO_READ')} title="Para Ler" className="border-2 border-black bg-[#FFE66D] px-2 py-1 text-xs hover:bg-black hover:text-white">⏳</button>
                    <button onClick={() => onChangeStatus(book.id, 'READING')} title="Lendo" className="border-2 border-black bg-[#4ECDC4] px-2 py-1 text-xs hover:bg-black hover:text-white">📖</button>
                    <button onClick={() => onChangeStatus(book.id, 'FINISHED')} title="Concluído" className="border-2 border-black bg-[#FF6B6B] px-2 py-1 text-xs hover:bg-black hover:text-white">✅</button>
                    <button onClick={() => onDelete(book.id)} title="Remover" className="border-2 border-black bg-black px-2 py-1 text-xs text-white hover:bg-red-500">🗑️</button>
                  </div>
                </div>
                <div className="mx-auto h-4 w-4 -translate-y-2 rotate-45 border-b-4 border-r-4 border-black bg-white"></div>
              </div>

              <motion.div
                whileHover={{ y: -16 }}
                className="relative z-10 aspect-[2/3] w-full cursor-pointer overflow-hidden border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              >
                <img
                  src={book.coverUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400'}
                  alt={book.title}
                  className="h-full w-full object-cover saturate-50 transition-all duration-300 group-hover:scale-105 group-hover:saturate-100"
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}