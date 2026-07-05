import { useState } from 'react';
import { motion } from 'framer-motion';

interface SavedBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: 'TO_READ' | 'READING' | 'FINISHED';
}

const MOCK_BOOKS: SavedBook[] = [
  {
    id: '1',
    title: 'O Nome do Vento',
    author: 'Patrick Rothfuss',
    coverUrl: 'https://books.google.com/books/content?id=h3x_zQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    status: 'TO_READ',
  },
  {
    id: '2',
    title: 'Duna',
    author: 'Frank Herbert',
    coverUrl: 'https://books.google.com/books/content?id=B1r5vQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    status: 'READING',
  },
  {
    id: '3',
    title: 'Fundação',
    author: 'Isaac Asimov',
    coverUrl: 'https://books.google.com/books/content?id=R3kOEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    status: 'FINISHED',
  },
  {
    id: '4',
    title: 'Neuromancer',
    author: 'William Gibson',
    coverUrl: 'https://books.google.com/books/content?id=xM9sDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    status: 'TO_READ',
  }
];

export function Profile() {
  const [books] = useState<SavedBook[]>(MOCK_BOOKS);

  const toRead = books.filter(b => b.status === 'TO_READ');
  const reading = books.filter(b => b.status === 'READING');
  const finished = books.filter(b => b.status === 'FINISHED');

  return (
    <div className="min-h-screen bg-[#FDFBF7] bg-noise p-6 md:p-12">
      <header className="mb-24 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-28 w-28 -rotate-6 items-center justify-center border-4 border-black bg-[#A06CD5] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:rotate-0">
          <span className="font-sans text-5xl font-black text-white">AB</span>
        </div>
        <h2 className="font-sans text-5xl font-black uppercase tracking-tighter text-black md:text-6xl">Alice Barbosa</h2>
        <span className="mt-4 inline-block border-2 border-black bg-white px-4 py-1 font-sans text-sm font-bold uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Santuário Literário
        </span>
      </header>

      <div className="mx-auto max-w-7xl space-y-24">
        <BookSection title="Lendo Atualmente" books={reading} badgeColor="bg-[#4ECDC4]" />
        <BookSection title="Para Ler" books={toRead} badgeColor="bg-[#FFE66D]" />
        <BookSection title="Concluídos" books={finished} badgeColor="bg-[#FF6B6B]" />
      </div>
    </div>
  );
}

function BookSection({ title, books, badgeColor }: { title: string; books: SavedBook[]; badgeColor: string }) {
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
        <div className="flex w-full snap-x snap-mandatory items-end gap-8 overflow-x-auto border-b-8 border-black px-4 pb-0 pt-24
          [&::-webkit-scrollbar]:h-4 
          [&::-webkit-scrollbar-track]:border-t-4 [&::-webkit-scrollbar-track]:border-black [&::-webkit-scrollbar-track]:bg-[#FDFBF7] 
          [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-black [&::-webkit-scrollbar-thumb]:bg-black"
        >
          {books.map((book) => (
            <div key={book.id} className="group relative flex w-40 flex-none snap-start flex-col items-center justify-end">
              
              <div className="pointer-events-none absolute -top-20 left-1/2 z-20 w-48 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="border-4 border-black bg-white p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="line-clamp-2 font-sans text-xs font-black uppercase leading-tight text-black">{book.title}</h4>
                  <p className="line-clamp-1 mt-1 font-sans text-[10px] font-bold uppercase tracking-wide text-zinc-500">{book.author}</p>
                </div>
                <div className="mx-auto h-4 w-4 -translate-y-2 rotate-45 border-b-4 border-r-4 border-black bg-white"></div>
              </div>

              <motion.div
                whileHover={{ y: -16 }}
                className="relative z-10 aspect-[2/3] w-full cursor-pointer overflow-hidden border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              >
                <img
                  src={book.coverUrl}
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