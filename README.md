# 📚 Biblioteca Virtual: Leitura às Cegas

> Um projeto de imersão literária desenvolvido para o programa de Trainee da **Serra Júnior Engenharia**.


## 🎯 A Proposta
No mundo atual, somos condicionados a julgar um livro pela capa, pelo autor famoso ou pelo selo de best-seller. A **Biblioteca Virtual** nasceu para subverter essa lógica através da "Leitura às Cegas". 

O objetivo do projeto é desenvolver uma plataforma web onde os usuários escolhem seus interesses literários e recebem recomendações focadas **exclusivamente na sinopse**. A capa, o título e o autor só são revelados caso o usuário se interesse genuinamente pela história e decida interagir com o enigma.

## 💡 A Nossa Solução e Arquitetura Lógica
Para transformar esse conceito em uma aplicação escalável e com excelente Experiência do Usuário (UX), dividimos nossa solução em pilares arquitetônicos:

### 1. O Motor de Recomendação (Front-end API Filtering)
A integração com a API do Google Books apresentou um desafio: resultados repetitivos e poluição de dados (livros em outros idiomas ou sem sinopse). Desenvolvemos um algoritmo de curadoria no próprio Front-end que atua como um pipeline de dados:
*   **Busca Composta e Randomização:** Em vez de buscar apenas pela categoria ("Mistério"), o algoritmo mapeia campos semânticos (`+suspense+investigacao+crime`) e utiliza paginação aleatória (`startIndex`) para garantir que o usuário nunca receba a mesma recomendação duas vezes.
*   **Quality Score (Pontuação de Qualidade):** Os dados recebidos passam por um filtro de Processamento de Linguagem Natural (NLP) leve. O sistema remove artefatos HTML, valida o idioma português através de Regex, desduplica títulos e atribui uma pontuação baseada no tamanho e na densidade da sinopse.
*   **Resiliência (Exponential Backoff):** Implementamos uma lógica de *retry* com recuo exponencial para interceptar e contornar quedas do servidor do Google (Erro 503), garantindo que a interface não quebre.

### 2. Gerenciamento e Persistência (Back-end)
A aplicação conta com uma infraestrutura de Back-end para o controle de usuários e estantes virtuais, garantindo que a jornada do leitor seja salva de forma segura.
*   Autenticação e controle de sessão.
*   Banco de dados relacional para gerenciar a relação entre `Usuários` e `Livros_Salvos`.
*   API RESTful para alimentar a página de "Minha Estante", categorizando os livros entre *Lendo Atualmente*, *Para Ler* e *Concluídos*.

## 🚀 Tecnologias Utilizadas

**Front-end:**
*   React + TypeScript
*   Vite
*   Tailwind CSS (Estilização Neobrutalista)
*   Framer Motion (Animações de física)
*   React Router DOM
  

**Back-end & Infraestrutura:**
*   Node js.
*   Prisma
*   Integração: Google Books API

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) e o seu gerenciador de banco de dados (ex: MySQL, PostgreSQL) instalados em sua máquina.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/alicebsrz/trabalho-traineeserra.git](https://github.com/alicebsrz/trabalho-traineeserra.git)
cd trabalho-traineeserra
```
### 2. Configurando o frontend

# Entre na pasta do front-end (ajuste o nome se necessário)
cd frontend

# Instale as dependências
```
npm install
```
# Crie o arquivo .env na raiz do front-end e adicione sua chave de API

```
echo "VITE_GOOGLE_BOOKS_API_KEY=sua_chave_aqui" > .env
```

# Inicie o servidor de desenvolvimento do React/Vite
```
npm run dev
```
### 2. Configurando o backend

# Volte para a raiz do repositório e entre na pasta do back-end
```
cd ../backend
```

# Instale as dependências do servidor 
```
npm install
```

# Inicie o servidor do back-end
```
npm start
```

👩‍💻 Equipe de Desenvolvimento
Projeto construído de forma colaborativa pelos trainees:

Alice de Souza Barbosa

Antônio Luiz Ferreira Neto

Joaquim de Souza Diniz

Desenvolvido com 🖤 para o processo de trainee da Serra Júnior Engenharia.
