import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LITERARY_TAGS = [
  { id: 'Romance', color: 'bg-[#FF6B6B]' },
  { id: 'Ficção', color: 'bg-[#4ECDC4]' },
  { id: 'Mistério', color: 'bg-[#FFE66D]' },
  { id: 'Fantasia', color: 'bg-[#1A535C]' },
];

export function Home() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDiscover = () => {
    if (selectedTags.length === 0) return;
    navigate('/results', { state: { tags: selectedTags } });
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#FDFBF7] bg-noise px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-16 lg:flex-row lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-2xl"
        >
          <span className="mb-4 inline-block font-sans text-sm font-bold uppercase tracking-widest text-orange-600">
            Não sabe o que ler?
          </span>
          <h1 className="mb-8 font-sans text-7xl font-black uppercase leading-none tracking-tighter text-black md:text-9xl">
            LEITURA<br />ÀS<br />CEGAS
          </h1>
          
          <div className="flex max-w-md items-center rounded-full border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="flex-1 truncate px-4 font-sans font-bold text-black">
              {selectedTags.length > 0 
                ? `${selectedTags.length} enigma(s) aguardando...`
                : 'Selecione os gêneros ao lado'}
            </span>
            <button
              onClick={handleDiscover}
              disabled={selectedTags.length === 0}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              title="Descobrir livros"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          <p className="mt-8 max-w-md font-sans text-lg font-medium text-zinc-700">
            Nunca mais <strong>julgue um livro pela capa</strong>. O conceito é simples: 
            você escolhe as temáticas que deseja explorar e nós te entregamos um{' '}
            <span className="font-bold text-orange-600">encontro às cegas</span> literário. 
            Apaixone-se pela sinopse misteriosa antes mesmo de descobrir o título ou o autor.
          </p>
        </motion.div>

        <div className="relative mt-16 flex h-[400px] flex-1 items-end justify-center gap-4 lg:mt-0 lg:h-[600px] lg:justify-end lg:gap-8">
          {LITERARY_TAGS.map((tag, index) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <motion.button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                initial={{ y: 100, opacity: 0 }}
                animate={{ 
                  y: isSelected ? -40 : 0, 
                  opacity: 1,
                  rotate: [0, 15]
                }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ y: isSelected ? -40 : -20 }}
                className={`relative flex h-72 w-16 origin-bottom items-start justify-center border-4 border-black ${tag.color} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors md:h-96 md:w-24 ${isSelected ? 'opacity-100' : 'opacity-80 saturate-50 hover:opacity-100 hover:saturate-100'}`}
              >
                <div className="mt-6 flex h-8 w-8 items-center justify-center rounded-full border-4 border-black bg-white md:h-10 md:w-10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <span className="absolute bottom-20 -rotate-90 whitespace-nowrap font-sans text-2xl font-black uppercase tracking-widest text-black md:text-3xl">
                  {tag.id}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}