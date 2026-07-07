/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [isLogin, setIsLogin] = useState(true); // Controla se a tela é Login ou Cadastro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

 
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
   
      const endpoint = isLogin 
        ? 'http://localhost:3333/login' 
        : 'http://localhost:3333/user';

    
      const payload = isLogin 
        ? { email, password } 
        : { name, email, password };

     
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro inesperado.');
      }

      
      if (!isLogin) {
        alert('Conta criada com sucesso! Faça seu login agora.');
        setIsLogin(true);
        setPassword(''); 
        return;
      }

      if (isLogin && data.token) {
        localStorage.setItem('@BibliotecaVirtual:token', data.token);
      
        localStorage.setItem('@BibliotecaVirtual:user', JSON.stringify(data.user));
        
        navigate('/profile'); 
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4ECDC4] bg-noise p-6">
      <div className="w-full max-w-md border-4 border-black bg-[#FDFBF7] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        {}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#FF6B6B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
            <span className="font-sans text-3xl font-black text-white">BV</span>
          </div>
          <h2 className="font-sans text-4xl font-black uppercase tracking-tighter text-black">
            {isLogin ? 'Acessar Estante' : 'Criar Conta'}
          </h2>
          <p className="mt-2 font-sans text-sm font-bold uppercase tracking-wider text-zinc-600">
            {isLogin ? 'Identifique-se para ver seus livros' : 'Junte-se à leitura às cegas'}
          </p>
        </div>

        {}
        {error && (
          <div className="mb-6 border-4 border-black bg-[#FF6B6B] p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-sans text-sm font-bold uppercase text-white">{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          
          {/* Campo Nome (Aparece apenas no Cadastro) */}
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-black uppercase tracking-widest text-black">
                Seu Nome
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                placeholder="Como quer ser chamado?"
                className="border-4 border-black p-4 font-sans text-lg font-bold text-black outline-none transition-all focus:bg-[#FFE66D] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-sans text-sm font-black uppercase tracking-widest text-black">
              E-mail
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="border-4 border-black p-4 font-sans text-lg font-bold text-black outline-none transition-all focus:bg-[#FFE66D] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans text-sm font-black uppercase tracking-widest text-black">
              Senha
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="border-4 border-black p-4 font-sans text-lg font-bold text-black outline-none transition-all focus:bg-[#FFE66D] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`mt-4 border-4 border-black py-4 font-sans text-xl font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
              isLoading 
                ? 'bg-zinc-500 cursor-not-allowed translate-y-1 shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-black hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {isLoading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        {}
        <div className="mt-8 border-t-4 border-black pt-6 text-center">
          <p className="font-sans text-sm font-bold text-zinc-600">
            {isLogin ? "Ainda não tem uma estante?" : "Já possui uma estante?"}
          </p>
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="mt-2 font-sans text-sm font-black uppercase tracking-widest text-[#FF6B6B] underline decoration-4 underline-offset-4 transition-colors hover:text-black"
          >
            {isLogin ? 'Crie sua conta aqui' : 'Faça login aqui'}
          </button>
        </div>

      </div>
    </div>
  );
}