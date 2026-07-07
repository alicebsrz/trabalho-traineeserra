import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverUrl: string;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    language?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  items?: GoogleBookItem[];
}

type ProcessedGoogleBookItem = GoogleBookItem & { 
  cleanDesc: string;
  qualityScore: number;
};

class ApiError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.cause = cause;
  }
}

const CARD_COLORS = [
  'bg-[#FF6B6B]', 
  'bg-[#4ECDC4]', 
  'bg-[#FFE66D]', 
  'bg-[#A06CD5]', 
  'bg-[#FF9F1C]', 
  'bg-[#8D99AE]'  
];

export function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'none' | 'empty' | 'api'>('none');

  const locationState = location.state as { tags?: string[] } | null;
  const rawTags = locationState?.tags;
  const tags = useMemo(() => rawTags || [], [rawTags]);

  const fetchBooks = useCallback(async (signal?: AbortSignal) => {
    try {
      const subjectMap: Record<string, string> = {
        Romance: 'subject:Romance',
        'Ficção': 'subject:Fiction',
        'Mistério': 'subject:Mystery',
        Fantasia: 'subject:Fantasy',
      };

      const expansionMap: Record<string, string[]> = {
        Romance: ['amor', 'paixao', 'drama', 'relacionamento', 'casal'],
        'Ficção': ['aventura', 'narrativa', 'conto', 'literatura', 'scifi'],
        'Mistério': ['suspense', 'investigacao', 'crime', 'enigma', 'policial'],
        Fantasia: ['magia', 'reino', 'epico', 'sobrenatural', 'ficcao'],
      };

      const queries = tags.flatMap((tag) => {
        const subject = subjectMap[tag];
        const keywords = expansionMap[tag] || [];

        const searchQueries: string[] = [];
        if (subject) searchQueries.push(subject);
        
        searchQueries.push(tag);
        keywords.forEach((keyword) => {
          searchQueries.push(`${tag}+${keyword}`);
        });

        // Embaralha as queries para aumentar a variedade
        return searchQueries.sort(() => 0.5 - Math.random());
      });

      const apiKey = import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY || '';
      const keyParam = apiKey ? `&key=${apiKey}` : '';

      const maxRetries = 3;
      const maxSearchAttempts = 3;
      const pageSize = 40;
      const minimumAcceptedLength = 40; // Sugestão 2: Reduzido para capturar mais e ranquear depois

      // Sugestão 4: Regex para remover lixo automatizado
      const junkRegex = /(copyright|all rights reserved|isbn|preview|google books|publicado por|direitos reservados|reprodução proibida)/i;
      
      const collected = new Map<string, ProcessedGoogleBookItem>();
      const seenTitles = new Set<string>(); // Sugestão 3: Desduplicação por título

      // Pegamos apenas algumas queries aleatórias para não sobrecarregar a API
      const queriesToRun = queries.slice(0, 3);

      for (const searchQuery of queriesToRun) {
        for (let attempt = 0; attempt < maxSearchAttempts && collected.size < 15; attempt++) {
          const randomStartIndex = Math.floor(Math.random() * 150) + attempt * pageSize;
          const encodedQuery = encodeURIComponent(searchQuery);
          const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&langRestrict=pt&printType=books&maxResults=${pageSize}&startIndex=${randomStartIndex}${keyParam}`;

          let retries = 0;
          let response: Response | null = null;

          while (retries <= maxRetries) {
            try {
              response = await fetch(url, { signal });
              if (response.ok) break;

              if (response.status === 503 && retries < maxRetries) {
                const delay = Math.pow(2, retries) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
                retries++;
              } else {
                throw new ApiError('API_ERROR');
              }
            } catch (error: unknown) {
              if (error instanceof DOMException && error.name === 'AbortError') throw error;
              if (retries >= maxRetries) throw new ApiError('API_ERROR', error);
              
              const delay = Math.pow(2, retries) * 1000;
              await new Promise((resolve) => setTimeout(resolve, delay));
              retries++;
            }
          }

          if (!response) throw new ApiError('API_ERROR');

          const data = (await response.json()) as GoogleBooksResponse;

          if (!data.items || data.items.length === 0) continue;

          data.items.forEach((item) => {
            // Sugestão 1: Validação estrita de idioma
            const lang = item.volumeInfo.language;
            if (lang && !lang.startsWith('pt')) return;

            const rawDesc = item.volumeInfo.description;
            if (!rawDesc) return;

            // Limpeza de HTML
            const cleanDesc = rawDesc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

            if (cleanDesc.length < minimumAcceptedLength) return;
            if (junkRegex.test(cleanDesc)) return;

            // Sugestão 3: Verifica se já pegamos esse livro (mesmo que com ID diferente)
            const title = item.volumeInfo.title || '';
            const normalizedTitle = title.toLowerCase().trim();
            if (seenTitles.has(normalizedTitle)) return;

            // Sugestão 5: Pontuação de Qualidade (Tamanho da string + Densidade de pontuação/frases)
            const sentenceCount = (cleanDesc.match(/[.!?]+/g) || []).length;
            const qualityScore = cleanDesc.length + (sentenceCount * 25);

            seenTitles.add(normalizedTitle);
            collected.set(item.id, { ...item, cleanDesc, qualityScore });
          });
        }

        if (collected.size >= 12) break;
      }

      // Ordena todos os livros capturados baseados na Pontuação de Qualidade
      const allCandidates = Array.from(collected.values()).sort(
        (a, b) => b.qualityScore - a.qualityScore
      );

      const selectedBooks = allCandidates.slice(0, 6);

      if (selectedBooks.length === 0) {
        setErrorType('empty');
        return;
      }

      const formattedBooks: Book[] = selectedBooks.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title || 'Título Desconhecido',
        authors: item.volumeInfo.authors || ['Autor Desconhecido'],
        description: item.cleanDesc,
        coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')?.replace('&zoom=1', '&zoom=0') || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400&h=600',
      }));

      setBooks(formattedBooks);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if ((error instanceof Error && error.message === 'API_ERROR') || !window.navigator.onLine) {
        setErrorType('api');
      } else {
        setErrorType('empty');
      }
    } finally {
      setLoading(false);
    }
  }, [tags]);

  const handleRetry = () => {
    setLoading(true);
    setErrorType('none');
    void fetchBooks();
  };

  useEffect(() => {
    if (tags.length === 0) {
      navigate('/');
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchBooks(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchBooks, navigate, tags.length]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] bg-noise p-6 md:p-12">
      <header className="mb-16 flex flex-col items-center text-center">
        <span className="mb-4 inline-block border-2 border-black bg-white px-4 py-1 font-sans text-sm font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          O Destino Escolheu
        </span>
        <h2 className="mb-4 font-sans text-5xl font-black uppercase tracking-tighter text-black md:text-7xl">
          Sua Seleção
        </h2>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-16 w-16 animate-spin rounded-full border-8 border-black border-t-orange-500"></div>
            <p className="animate-pulse font-sans text-2xl font-black uppercase tracking-widest text-black">
              Buscando na Biblioteca...
            </p>
          </div>
        </div>
      ) : errorType === 'empty' ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center border-4 border-black bg-[#FFE66D] p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-6 font-sans text-4xl font-black uppercase text-black">Nenhum Enigma Encontrado!</h3>
          <p className="mb-8 font-sans text-xl font-bold text-zinc-800">
            A sua combinação de categorias foi tão única que nossos arquivos não encontraram livros com sinopses longas o suficiente em português.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="border-4 border-black bg-black px-8 py-4 font-sans text-xl font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(255,107,107,1)]"
          >
            Tentar Outra Combinação
          </button>
        </div>
      ) : errorType === 'api' ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center border-4 border-black bg-[#FF6B6B] p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="mb-6 font-sans text-4xl font-black uppercase text-white">A API Falhou</h3>
          <p className="mb-8 font-sans text-xl font-bold text-white">
            O servidor do Google Books está indisponível no momento.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={handleRetry}
              className="border-4 border-black bg-white px-8 py-4 font-sans text-xl font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              Reconectar
            </button>
            <button 
              onClick={() => navigate('/')}
              className="border-4 border-black bg-black px-8 py-4 font-sans text-xl font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(78,205,196,1)]"
            >
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book, index) => (
            <BlindBookCard 
              key={book.id} 
              book={book} 
              bgColor={CARD_COLORS[index % CARD_COLORS.length]} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BlindBookCard({ book, bgColor }: { book: Book; bgColor: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const handleSaveBook = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();

    const token = localStorage.getItem('@BibliotecaVirtual:token');

    if (!token) {
      alert('Voce precisa estar logado para salvar livros na estante!');
      navigate('/login');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:3333/livros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: book.title,
          author: book.authors ? book.authors.join(', ') : 'Autor Desconhecido',
          coverUrl: book.coverUrl,
          status: 'TO_READ',
        }),
      });

      if (response.ok) {
        setIsSaved(true);
      } else {
        throw new Error('Falha ao salvar no banco de dados');
      }
    } catch (error) {
      console.error(error);
      alert('Ops! Houve um erro ao salvar o livro. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group relative h-[550px] w-full cursor-pointer" style={{ perspective: 1000 }}>
      <motion.div
        className="absolute h-full w-full transition-all duration-500"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Lado da Sinopse (Frente) */}
        <div 
          className={`absolute flex h-full w-full flex-col justify-between border-4 border-black ${bgColor} p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-4">
              <h3 className="font-sans text-2xl font-black uppercase tracking-widest text-black">Enigma</h3>
              <div className="h-6 w-6 rounded-full border-4 border-black bg-white"></div>
            </div>
            
            <div className="mb-4 flex-1 overflow-y-auto border-4 border-black bg-white/50 p-4 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,1)] 
              [&::-webkit-scrollbar]:w-3 
              [&::-webkit-scrollbar-track]:border-l-4 [&::-webkit-scrollbar-track]:border-black [&::-webkit-scrollbar-track]:bg-white 
              [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-black [&::-webkit-scrollbar-thumb]:bg-black">
              <p className="break-words font-sans text-base font-bold leading-relaxed text-black">
                {book.description}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsRevealed(true)}
            className="w-full shrink-0 border-4 border-black bg-white py-4 font-sans text-lg font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]"
          >
            Revelar Capa
          </button>
        </div>

        {/* Lado da Capa (Costas) */}
        <div 
          className="absolute flex h-full w-full flex-col items-center justify-between border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="mb-4 h-56 w-40 border-4 border-black object-cover shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 group-hover:scale-105"
            />
            <h3 className="line-clamp-3 text-center font-sans text-xl font-black uppercase leading-tight text-black">
              {book.title}
            </h3>
            <p className="line-clamp-2 mt-2 text-center font-sans text-sm font-bold uppercase tracking-wide text-zinc-500">
              {book.authors.join(', ')}
            </p>
          </div>
          
          <button 
            className={`w-full shrink-0 border-4 border-black py-4 font-sans text-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform ${
              isSaved
                ? 'bg-[#4ECDC4] text-black cursor-default'
                : 'bg-black text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(255,107,107,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
            }`}
            onClick={isSaved ? undefined : handleSaveBook}
            disabled={isSaving || isSaved}
          >
            {isSaving ? 'Guardando...' : isSaved ? '✓ Salvo na Estante' : '+ Guardar na Estante'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}