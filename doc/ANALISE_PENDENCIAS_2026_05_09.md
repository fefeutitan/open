# Analise de pendencias do projeto Open (2026-05-09)

## Resumo da retomada

Nesta retomada, o foco foi avancar o frontend Angular de uma base estatica para um conjunto inicial de telas realmente navegaveis e conectadas ao backend. O sistema agora ja permite visualizar uma estrutura de navegacao mais proxima do produto final, com contexto de campeonato e primeira tela de cadastro operacional vinculada a esse contexto.

O ganho principal do dia foi transformar o frontend em algo utilizavel para demonstracao e validacao de fluxo:

- tela de campeonatos com listagem e cadastro;
- tela de detalhe de campeonato;
- tela de atletas vinculada ao campeonato;
- navegacao entre painel, campeonatos, detalhe e atletas;
- consumo de endpoints reais ja existentes no backend.

Em termos de maturidade, a API continua em bom estado para MVP, e o frontend saiu do estagio de esqueleto para um primeiro fluxo coerente de uso.

## O que foi feito em 2026-05-09

### Frontend Angular - estrutura de navegacao

- Ajustado o shell principal do Angular para usar rotas reais.
- O painel inicial foi separado em pagina propria.
- A navegacao lateral passou a funcionar com `RouterLink`.
- O Angular foi configurado com `HttpClient` para consumo da API.

### Tela de campeonatos

- Criada rota:
  - `/campeonatos`
- Implementada integracao com endpoints reais:
  - `GET /api/campeonatos`
  - `POST /api/campeonatos`
- Tela entrega:
  - listagem de campeonatos;
  - formulario de cadastro;
  - resumo com contagem;
  - estados de carregamento e erro.

### Tela de detalhe de campeonato

- Criada rota:
  - `/campeonatos/{id}`
- Implementada integracao com endpoint real:
  - `GET /api/campeonatos/{id}`
- Tela entrega:
  - nome;
  - descricao;
  - local;
  - periodo;
  - status;
  - identificador;
  - bloco de navegacao para proximas areas do sistema.

### Tela de atletas por campeonato

- Criada rota:
  - `/campeonatos/{id}/atletas`
- Implementadas integracoes com endpoints reais:
  - `GET /api/cadastros/atletas?campeonatoId={id}`
  - `GET /api/cadastros/categorias?campeonatoId={id}`
  - `GET /api/cadastros/nucleos?campeonatoId={id}`
  - `POST /api/cadastros/atletas`
- Tela entrega:
  - listagem de atletas do campeonato;
  - formulario de cadastro;
  - selecao de categoria e nucleo com dados reais;
  - bloqueio pratico do cadastro quando faltam categorias ou nucleos;
  - resumo de quantidade de atletas e dependencias.

### Servicos de frontend criados ou ampliados

- `CampeonatoApiService`
  - listagem;
  - criacao;
  - busca por id.
- `CadastroApiService`
  - listagem de atletas por campeonato;
  - criacao de atleta;
  - listagem de categorias por campeonato;
  - listagem de nucleos por campeonato.

### Validacao

- `npm run build` validado com sucesso apos as entregas do dia.
- Frontend validado em desenvolvimento usando a pasta `app/`.
- Observacao operacional confirmada:
  - o frontend deve ser executado a partir de `open/app`;
  - o backend deve estar em `localhost:8080` para o proxy `/api` funcionar.

## Estado atual do frontend

### Pronto ou bem encaminhado

- Shell base da aplicacao.
- Painel inicial.
- Roteamento Angular funcional.
- Tela de campeonatos com integracao real.
- Tela de detalhe de campeonato com integracao real.
- Tela de atletas por campeonato com integracao real.
- Servicos iniciais para consumo da API.

### Pontos de atencao

- A tela de atletas depende de categorias e nucleos ja cadastrados no campeonato.
- Ainda nao existe fluxo frontend para cadastrar categorias e nucleos.
- Ainda nao ha padrao unificado de tratamento de erro vindo do backend.
- Ainda nao ha componentes compartilhados de layout/formulario; o codigo de tela ainda esta mais direto por feature.
- Ainda nao ha autenticacao, guarda de rotas ou perfil de usuario.

## Estado atual do backend em relacao ao frontend

### Ja suficiente para as telas atuais

- `GET /api/campeonatos`
- `GET /api/campeonatos/{id}`
- `POST /api/campeonatos`
- `GET /api/cadastros/atletas?campeonatoId=...`
- `POST /api/cadastros/atletas`
- `GET /api/cadastros/categorias?campeonatoId=...`
- `GET /api/cadastros/nucleos?campeonatoId=...`

### Ainda faltando para evoluir a experiencia operacional

- consultas operacionais de jogos com filtros;
- listagem de desempates pendentes;
- cadastros frontend de categorias, nucleos e juizes;
- melhor classificacao e exposicao de erros de regra de negocio.

## Melhorias futuras recomendadas

### P1 - Frontend

1. Criar tela de categorias por campeonato:
   - listagem;
   - cadastro;
   - base para destravar o uso real de atletas.

2. Criar tela de nucleos por campeonato:
   - listagem;
   - cadastro;
   - suporte ao formulario de atletas sem dependencia externa.

3. Criar tela de juizes por campeonato:
   - listagem;
   - cadastro;
   - preparacao para sumulas.

4. Evoluir o detalhe do campeonato para virar hub do sistema:
   - cards com contadores reais;
   - links para atletas, categorias, nucleos, juizes, fases e jogos.

5. Criar servico de competicao no Angular:
   - jogos;
   - fases;
   - grupos;
   - classificacao;
   - sumulas.

6. Criar tela basica de jogos:
   - listagem simples;
   - status;
   - acao de iniciar jogo;
   - base visual para operacao.

### P1 - Backend de apoio ao frontend

7. Criar consultas operacionais de jogos:
   - por campeonato;
   - por fase;
   - por grupo;
   - por categoria;
   - por status;
   - por data.

8. Criar endpoint para desempates pendentes.

9. Melhorar tratamento de erros:
   - separar 404 de regra de negocio;
   - usar 400 para entrada invalida;
   - usar 409 para conflito de estado.

10. Revisar consistencias na criacao de jogo:
   - fase e categoria no mesmo campeonato;
   - atletas da categoria correta;
   - grupo pertencente a fase;
   - impedir atleta contra ele mesmo;
   - avaliar jogos duplicados.

### P2 - Estruturacao do produto

11. Criar componentes compartilhados no frontend:
   - shell de pagina;
   - cards de resumo;
   - estados vazios;
   - feedback de erro;
   - formularios padronizados.

12. Adicionar documentacao OpenAPI/Swagger.

13. Preparar perfil `prod` com Postgres e migracoes versionadas.

14. Adicionar autenticacao e autorizacao.

## Proximo passo sugerido

O proximo passo tecnico mais util e criar as telas de `Categorias` e `Nucleos` por campeonato. Isso fecha as dependencias da tela de atletas e transforma esse primeiro fluxo frontend em algo realmente utilizavel sem preparacao manual externa.
