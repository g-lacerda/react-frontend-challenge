# Decisões técnicas

Este documento explica por que o CineDash foi construído desta forma, o que a API do TMDB não permite fazer e onde ficaram as concessões.

## Estrutura de pastas

A organização segue **Feature-Sliced Design**, com cinco camadas e uma regra única: uma camada só importa das camadas abaixo dela.

```
src/
  app/        providers, rotas e layout — monta a aplicação
  pages/      uma pasta por tela, só composição
  features/   auth, filtros, lista, tema, idioma, configurações
  entities/   o filme: tipos, adaptadores da API, hooks e componentes
  shared/     cliente da TMDB, biblioteca de UI, i18n e utilitários
```

O que essa divisão resolve na prática: o botão de salvar aparece na descoberta, na lista e nos detalhes. Como ele vive em `features/watchlist` e lê a store de lá, as três telas compartilham o mesmo estado sem passar propriedades entre elas. Nenhuma tela sabe como a lista é guardada.

Dentro de cada fatia, a separação se repete: `model` para regra de negócio e estado, `api` para conversa com o servidor, `ui` para componentes e `lib` para funções puras. Isso mantém a lógica testável sem montar componente.

## Como a autenticação funciona sem backend

Não existe servidor, então o objetivo foi simular o fluxo real sem fingir segurança que não existe.

O formulário valida com **Zod**: e-mail no formato correto e senha com mais de seis caracteres. As mensagens de erro vêm do dicionário de traduções, então o schema é criado por uma função que recebe os textos já traduzidos, em vez de ter as mensagens fixas no código.

Ao enviar, uma store do **Zustand** gera um token fictício com `crypto.randomUUID` e guarda o e-mail. O middleware `persist` grava tudo em `cinedash:auth`, o que faz a sessão sobreviver ao recarregamento.

A proteção das rotas fica no roteador, não nos componentes. Existe uma rota sem caminho, chamada `authenticated`, que envolve descoberta, lista, detalhes e configurações. O `beforeLoad` dela verifica o token antes de qualquer coisa ser renderizada e, se não houver, redireciona para o login guardando o endereço de origem, para devolver o usuário ao lugar certo depois. A rota de login faz o inverso e manda quem já entrou para dentro.

A verificação lê o estado diretamente com `useAuthStore.getState()`, e não por hook, porque roda fora do ciclo de renderização do React.

**O que isso não é:** segurança. Qualquer pessoa altera o `localStorage` e entra. Num sistema real, o token viria do servidor, ficaria em cookie `httpOnly` e toda rota protegida seria validada no backend. Aqui o objetivo é reproduzir a estrutura do fluxo, e é isso que o desafio pede.

## Dados do servidor e cache

O **TanStack Query** cuida de tudo que vem da API. Os padrões: cinco minutos até um dado ficar velho, trinta minutos em memória, uma tentativa em caso de falha e nenhuma revalidação ao voltar para a aba. Isso evita chamadas desnecessárias numa API com limite de requisições.

As chaves de cache seguem o padrão de fábrica, num arquivo só:

```ts
movieKeys.list(locale, filters)   // ['movies', 'list', 'pt-BR', {...}]
movieKeys.details(locale, id)
movieKeys.genres(locale)
```

**O idioma faz parte da chave.** Isso é intencional: a mesma busca em português e em inglês são dados diferentes, com sinopse e gêneros traduzidos. Sem o idioma na chave, trocar de idioma mostraria conteúdo velho ou obrigaria a limpar o cache. Com ele, os dois idiomas convivem e alternar entre eles é instantâneo.

A lista de gêneros usa `staleTime: Infinity`, porque não muda.

A paginação usa `useInfiniteQuery` com `keepPreviousData`, o que mantém a lista anterior visível, levemente apagada, enquanto a nova chega. Sem isso, cada mudança de filtro pisca a tela.

O carregamento antecipado usa o `loader` da rota de detalhes junto com o preload por intenção do roteador: passar o mouse sobre um cartão já busca os detalhes, e a página abre sem esqueleto.

## Adaptadores entre a API e o aplicativo

A TMDB devolve `poster_path`, `vote_average`, `genre_ids`. O aplicativo trabalha com `posterPath`, `voteAverage`, `genreIds`.

A conversão acontece em `entities/movie/api/mappers.ts`, e os dois formatos são tipados separadamente: `MovieDto` descreve o que a API manda, `Movie` descreve o que a aplicação usa. Nenhum componente conhece o formato da TMDB.

Isso custa um arquivo a mais e paga em dois momentos: quando a API muda um campo, só o adaptador muda; e quando um campo vem ausente, o tratamento fica num lugar só. Foi exatamente o que aconteceu com `original_language`, que a API às vezes omite.

O adaptador também concentra decisões de produto: escolher qual vídeo é o trailer, preferindo YouTube, oficial e do tipo Trailer, com queda para Teaser; e ordenar o elenco para quem tem foto aparecer primeiro.

## Estado do cliente

Seis stores do Zustand, todas persistidas, cada uma com um assunto:

| Store | Guarda | Por quê |
|---|---|---|
| `auth` | Token e e-mail | Sessão sobrevive ao recarregamento |
| `watchlist` | Filmes salvos | Exigido pelo desafio |
| `filters` | Filtros da descoberta | Exigido pelo desafio |
| `theme` | Claro ou escuro | Exigido pelo desafio |
| `locale` | Idioma | Coerência entre sessões |
| `settings` | Efeitos sonoros | Preferência do usuário |

Stores pequenas e separadas evitam que mudar o tema faça componentes que só leem a lista renderizarem de novo. Os componentes leem sempre com seletor, nunca a store inteira.

O tema é aplicado fora do React: ao carregar o módulo, a store lê o valor guardado e escreve a classe no elemento raiz, e uma inscrição mantém isso sincronizado. Assim não há piscada de tema errado na primeira pintura.

Uma exceção: os filtros da tela Minha lista vivem em `useState`, não em store. Eles são um recorte temporário da visualização, não uma preferência que deva sobreviver ao recarregamento.

## Roteamento

TanStack Router com rotas definidas em código, não por arquivos. Com sete rotas, um arquivo só é mais fácil de ler que uma árvore de arquivos, e o roteador entrega a mesma tipagem.

A rota de detalhes converte o parâmetro para número na própria definição, então a página recebe `id: number` já validado. O `queryClient` é injetado no contexto do roteador, o que permite ao `loader` buscar dados antes da tela montar.

## Interface

O visual segue um sistema próprio, com uma regra central: **existem duas cores, e toda a hierarquia vem da opacidade de uma sobre a outra.** Sem sombra, sem gradiente, sem verde de sucesso ou vermelho de erro. Destaque se faz invertendo as cores.

Isso foi aplicado **sobre** o shadcn/ui, não no lugar dele. Os componentes continuam sendo os do shadcn, com Radix por baixo, e o que mudou foram as variáveis de tema e as classes. A alternativa, escrever componentes do zero em CSS puro, daria o mesmo visual e perderia acessibilidade, foco em armadilha, navegação por teclado e suporte a leitor de tela que o Radix já entrega testados.

Duas famílias tipográficas com papéis fixos: Space Grotesk para texto, com espaçamento negativo nos títulos, e JetBrains Mono só para micro-rótulos em caixa alta. O contraste entre as duas é metade da identidade.

Um ajuste foi necessário por acessibilidade: o degrau de opacidade usado em texto secundário era 45%, o que dava contraste de 4,01 no tema escuro e 3,02 no claro, abaixo dos 4,5 exigidos pela WCAG AA. Calculei a curva nos dois temas e subi para 60%, chegando a 6,47 e 4,84. O visual ficou um pouco menos sutil, e a legibilidade é mais importante.

## Idiomas

Três idiomas sem biblioteca de internacionalização. Um objeto tipado por idioma, com o português como fonte da verdade:

```ts
export type Dictionary = typeof ptBR
```

Os outros dois são declarados como `Dictionary`, então esquecer uma chave quebra a compilação. Strings com valores dinâmicos são funções, como `count: (total: number) => ...`, o que mantém a ordem das palavras correta em cada idioma em vez de concatenar pedaços.

Para algumas dezenas de textos, isso dá autocompletar, verificação em tempo de compilação e nenhum peso extra no pacote. Uma biblioteca faria sentido com plurais complexos, formatação de datas por região ou textos vindos de tradutores externos.

Números e datas usam `Intl` diretamente. Os nomes dos idiomas na lista de filtros vêm de `Intl.DisplayNames`, então "coreano" e "Korean" aparecem sem manter tabela manual.

## Efeitos sonoros

Sons curtos ao salvar, remover, entrar e passar o mouse pelos cartões, todos sintetizados com a Web Audio API. Nenhum arquivo de áudio: são osciladores e ruído filtrado, o que custa poucas linhas e nada de rede.

O detalhe que fez diferença no resultado: a primeira versão do sopro usava ruído branco com filtro passa-banda, e soava metálico, como um laser. Ruído branco tem energia igual em todas as frequências, e o passa-banda cria uma nota afinada. A versão final usa ruído marrom, concentrado nos graves, com apenas um passa-baixa abrindo e fechando devagar. Sem ressonância, não aparece nota.

O navegador mantém o contexto de áudio suspenso até um gesto real do usuário, e passar o mouse não conta. Por isso o contexto é destravado no primeiro clique ou tecla da sessão.

## Acessibilidade

Verificado com axe em todas as telas, nos dois temas, com menus abertos e com a lista cheia: nenhuma violação.

O que foi feito além do automático:

- Link para pular ao conteúdo como primeiro item da tabulação.
- Região que anuncia a contagem de resultados quando busca ou filtro mudam.
- Cabeçalhos de tabela com `aria-sort` e ordenação por teclado.
- Erros de formulário como alerta, com o campo marcado como inválido.
- Miniaturas decorativas escondidas do leitor de tela, já que o título ao lado identifica o filme.
- Todas as animações respeitam a preferência de movimento reduzido do sistema.

## Performance

O pacote é dividido por rota: cada tela é um arquivo próprio, baixado quando a rota abre. Ir da descoberta para a lista baixa 10 kB.

As bibliotecas ficam em blocos separados e estáveis, o que preserva o cache entre versões quando só o código da aplicação muda. O TanStack Table sai do carregamento inicial, porque só a lista usa tabela. A biblioteca de notificações, 36 kB, é carregada depois da primeira pintura, já que notificações só aparecem após uma ação.

Outras medidas: busca com atraso de 400 ms, rolagem infinita por `IntersectionObserver` disparando 400 px antes do fim, imagens com carregamento adiado, `preconnect` para a API e o CDN de imagens, e o trailer do YouTube só carregando ao clicar no play.

## Dificuldades com a API do TMDB

O enunciado pede esta seção, e foram várias.

**Filtros não funcionam na busca por texto.** O endpoint de busca aceita apenas título e ano; gênero, nota, duração e ordenação existem só no endpoint de descoberta, e não há como combinar os dois. A solução foi escolher o endpoint conforme o estado: com texto usa busca e aplica os filtros restantes no cliente; sem texto mas com filtro usa descoberta; sem nada usa tendências. Como o ano é aceito na busca, ele é enviado para a API mesmo nesse caso.

Isso tem um efeito visível: filtrando no cliente, a API manda vinte resultados por página e alguns são descartados, então a página pode vir com menos itens. A interface trata isso desativando ordenação e duração quando há texto na busca, com uma explicação no lugar, em vez de deixar controles que não fazem nada.

**Páginas repetem filmes.** A paginação da TMDB devolve o mesmo filme em páginas diferentes quando a popularidade muda entre as requisições. Isso gerava chaves duplicadas no React, que pode omitir ou duplicar cartões. A lista passou a ser deduplicada por id.

**A última fileira ficava incompleta.** Como a grade é fluida, a última linha aparecia com buracos enquanto a próxima página carregava. Enquanto há mais páginas, a grade mostra apenas fileiras completas; as colunas são medidas com `ResizeObserver`, então funciona em qualquer largura.

**A duração não vem na listagem.** O campo `runtime` existe só no endpoint de detalhes. Mostrar a duração nos cartões exigiria uma requisição por filme, vinte por página. Ela aparece na página de detalhes, e o filtro de duração funciona porque a API filtra no servidor mesmo sem devolver o campo.

**O pôster muda ao trocar o idioma.** Não é um defeito: a TMDB guarda uma arte por idioma, com o título impresso, e devolve a correspondente. Faz sentido para curadoria, já que é a arte que o público daquele idioma veria. Seria possível pedir a versão sem texto, ao custo de uma imagem mais genérica.

**Campos ausentes sem aviso.** `original_language` e `release_date` às vezes não vêm. O adaptador trata isso, e a interface mostra um traço no lugar.

**Filmes com poucos votos distorcem o filtro de nota.** Filtrar por nota 9 ou mais trazia filmes com dois votos e nota 10. Quando há filtro de nota e o usuário não definiu um mínimo de votos, é aplicado um mínimo de cinquenta.

## O que eu faria diferente com mais tempo

- **Testes automatizados.** A stack exige Vitest e Testing Library, e as funções puras já foram escritas pensando nisso: os filtros do cliente, os adaptadores e a escolha do trailer não dependem de React.
- **Virtualização da lista.** Depois de várias páginas, a grade acumula centenas de nós. Com TanStack Virtual, só o visível seria renderizado.
- **Estado dos filtros na URL.** Hoje os filtros são persistidos, mas não compartilháveis. Colocá-los na busca da URL permitiria mandar um link de "melhores dramas coreanos de 2019".
- **Sincronizar a lista com um servidor.** O `localStorage` não atravessa dispositivos.
