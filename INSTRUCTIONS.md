# Como rodar o CineDash

Projeto escolhido: **Opção A — CineDash**, o dashboard de curadoria de filmes descrito em [`cases/01-cinedash.md`](cases/01-cinedash.md).

## Pré-requisitos

- **Node.js 20.19 ou superior.** Desenvolvido na 20.20. O Vite 8 não roda em versões anteriores.
- **npm 10 ou superior**, que acompanha essa versão do Node.
- Uma conta gratuita no [TMDB](https://www.themoviedb.org/signup) para gerar o token de acesso.

## Token da API

A aplicação consome a API do TMDB e precisa de um token para funcionar. Sem ele, a tela exibe um erro explicando o que falta.

1. Crie a conta e confirme o e-mail.
2. Abra **Configurações → API** e solicite acesso de desenvolvedor. A aprovação é imediata.
3. Copie o **API Read Access Token**, o campo longo que começa com `eyJ`. Não use a chave curta: o cliente autentica por cabeçalho `Bearer`.

## Instalação

```bash
git clone https://github.com/g-lacerda/react-frontend-challenge.git
cd react-frontend-challenge
npm install
```

## Variáveis de ambiente

Copie o arquivo de exemplo e preencha com o seu token:

```bash
cp .env.example .env.local
```

```
VITE_TMDB_API_READ_ACCESS_TOKEN=eyJhbGciOi...
```

O `.env.local` é ignorado pelo Git e nunca vai para o repositório.

## Rodando

```bash
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

Na tela de login, qualquer e-mail válido com senha de mais de seis caracteres entra. Não há backend: o token é fictício e a sessão vive no navegador.

```
curador@cinedash.app
senha1234
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Verifica os tipos e gera a versão de produção em `dist/` |
| `npm run preview` | Serve a versão de produção localmente |
| `npm run lint` | Análise estática com oxlint |

## Onde ficam as preferências

Tudo é guardado no `localStorage` do navegador, com um prefixo por assunto:

| Chave | Conteúdo |
|---|---|
| `cinedash:auth` | Token fictício e e-mail da sessão |
| `cinedash:watchlist` | Filmes salvos em Minha lista |
| `cinedash:filters` | Filtros da tela de descoberta |
| `cinedash:theme` | Tema claro ou escuro |
| `cinedash:locale` | Idioma da interface |
| `cinedash:settings` | Efeitos sonoros ligados ou desligados |

Para começar do zero, limpe os dados do site pelas ferramentas do navegador.

## Problemas comuns

**A tela mostra erro sobre a variável de ambiente.** O `.env.local` não existe ou está sem o token. Depois de criar o arquivo, reinicie o `npm run dev`: variáveis de ambiente são lidas só na inicialização.

**A API responde 401.** O token copiado foi a chave curta em vez do Read Access Token, ou veio com espaços em volta.

**Os pôsteres mudam ao trocar o idioma.** É esperado. O TMDB tem uma arte por idioma e devolve a versão correspondente. Está detalhado em [ARCHITECTURE.md](ARCHITECTURE.md).
