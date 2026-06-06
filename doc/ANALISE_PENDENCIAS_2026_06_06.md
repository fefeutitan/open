# Analise de pendencias do projeto Open (2026-06-06)

## Resumo da retomada

Nesta retomada, o projeto saiu de um frontend operacional forte, mas ainda fragmentado em alguns pontos, para um fluxo muito mais fechado de competicao. O trabalho do dia concentrou-se em consolidar a Sprint 2 quase por completo e organizar melhor o repositorio.

O ganho principal foi transformar capacidades que antes estavam ausentes, inferidas ou parcialmente expostas em operacao real:

- classificacao por grupo exposta em tela;
- geracao de mata-mata exposta em tela;
- painel inicial conectado a dados reais;
- endpoint dedicado de desempates pendentes;
- filtros operacionais mais fortes na tela de jogos;
- organizacao dos relatorios de analise em `doc/`.

Em termos praticos, o sistema avancou de uma boa base operacional para um estado muito mais proximo de um MVP completo de gestao de campeonato.

To continue this session, run `codex resume 019e3130-b9ff-7191-b0e5-670591936ad1`

## O que foi feito em 2026-06-06

### Organizacao e versionamento

- Os arquivos `ANALISE_PENDENCIAS_*.md` foram movidos da raiz para a nova pasta `doc/`.
- Foi corrigida referencia interna em `doc/ANALISE_PENDENCIAS_2026-05-06.md`.
- O trabalho do dia foi versionado em commits separados, por tema:
  - `1facf9d` `docs(repo): move analises de pendencias para doc`
  - `a6390c9` `feat(frontend): adiciona classificacao e mata-mata em fases`
  - `c41059b` `feat(frontend): conecta painel a dados reais`
  - `6d7518d` `feat(competicao): adiciona consulta de desempates pendentes`
  - `32f6959` `feat(frontend): adiciona filtros operacionais em jogos`

### Backend - robustez e operacao

- Foi endurecido o backend com validacoes e semantica de erro mais corretas:
  - recurso inexistente com `404`;
  - regra de negocio invalida com `400`;
  - conflito de estado com `409`.
- Foram adicionadas validacoes de consistencia para:
  - cadastro de atleta com categoria e nucleo coerentes no mesmo campeonato;
  - criacao de jogo com fase, grupo, categoria e atletas consistentes.
- Foi criado endpoint dedicado de desempates pendentes:
  - `GET /api/competicao/jogos/desempates-pendentes?campeonatoId=...`
- Esse endpoint passou a retornar jogos agendados que representam desempate apos empate finalizado na mesma fase.

### Frontend - fases e competicao

- A tela `/campeonatos/{id}/fases` foi ampliada para:
  - consumir `GET /api/competicao/grupos/{grupoId}/classificacao`;
  - exibir classificacao por grupo;
  - mostrar tabela com:
    - posicao;
    - atleta;
    - pontos;
    - vitorias;
    - derrotas;
    - saldo.
- A mesma tela passou a consumir:
  - `POST /api/competicao/fases/{faseGruposId}/gerar-mata-mata`
- Foi criado fluxo guiado para gerar mata-mata:
  - selecao da fase de grupos de origem;
  - selecao da fase eliminatoria de destino;
  - bloqueio quando faltam fases adequadas;
  - bloqueio quando a fase de grupos nao define `classificadosPorGrupo`;
  - exibicao dos confrontos gerados.

### Frontend - painel operacional

- A rota inicial `/` deixou de ser estatica.
- O painel passou a carregar:
  - campeonatos reais;
  - jogos reais do campeonato selecionado;
  - desempates pendentes reais via endpoint dedicado.
- O painel agora entrega:
  - selecao de campeonato;
  - metricas reais:
    - jogos hoje;
    - jogos em andamento;
    - desempates pendentes;
    - jogos finalizados;
  - fila operacional priorizada;
  - atalhos para:
    - jogos;
    - fases;
    - detalhe do campeonato;
    - lista de campeonatos.

### Frontend - jogos e consultas operacionais

- A tela `/campeonatos/{id}/jogos` foi ampliada com filtros operacionais locais por:
  - status;
  - fase;
  - grupo;
  - categoria;
  - data.
- Foram adicionados:
  - resumo do recorte atual;
  - ajuste coerente do filtro de grupo conforme a fase;
  - botao para limpar filtros.

## Validacao

- `mvn test` foi executado com sucesso apos as alteracoes de backend.
- A suite passou com:
  - `19` testes;
  - `0` falhas.
- `npm run build` foi executado com sucesso ao longo das entregas do frontend.
- As features de:
  - classificacao por grupo;
  - geracao de mata-mata;
  - painel real;
  - filtros operacionais;
  foram integradas sem quebrar o build do Angular.

## Estado atual do frontend

### Pronto ou bem encaminhado

- Shell base da aplicacao.
- Painel inicial com dados reais.
- Navegacao por campeonatos.
- Detalhe de campeonato.
- Cadastro de atletas por campeonato.
- Cadastro de categorias por campeonato.
- Cadastro de nucleos por campeonato.
- Cadastro de juizes por campeonato.
- Configuracao de fases por campeonato.
- Configuracao de grupos por fase.
- Classificacao por grupo em tela.
- Geracao de mata-mata em tela.
- Gestao de jogos por campeonato.
- Criacao de jogos.
- Inicio de jogo.
- Registro de resultado.
- Registro de sumula.
- Correcao auditada de resultado.
- Correcao auditada de sumula.
- Filtros operacionais de jogos por fase, grupo, categoria, status e data.
- Exibicao de desempates pendentes no painel.
- Bloqueio guiado de dependencias na tela de atletas.

### Pontos de atencao

- O padrao de bloqueio guiado ainda nao foi replicado em todas as telas dependentes.
- Ainda nao ha padrao unificado de componentes compartilhados para formularios, feedback e estado vazio.
- O tratamento de erro exibido no frontend ainda pode ficar mais contextual.
- O painel ainda pode evoluir com visoes mais especificas de pendencias e operacao.

## Estado atual do backend em relacao ao frontend

### Ja suficiente para a operacao principal

- `GET /api/campeonatos`
- `GET /api/campeonatos/{id}`
- `POST /api/campeonatos`
- `GET /api/cadastros/categorias?campeonatoId=...`
- `POST /api/cadastros/categorias`
- `GET /api/cadastros/nucleos?campeonatoId=...`
- `POST /api/cadastros/nucleos`
- `GET /api/cadastros/juizes?campeonatoId=...`
- `POST /api/cadastros/juizes`
- `GET /api/cadastros/atletas?campeonatoId=...`
- `POST /api/cadastros/atletas`
- `GET /api/competicao/fases?campeonatoId=...`
- `POST /api/competicao/fases`
- `GET /api/competicao/grupos?faseId=...`
- `POST /api/competicao/grupos`
- `GET /api/competicao/grupos/{grupoId}/classificacao`
- `POST /api/competicao/fases/{faseGruposId}/gerar-mata-mata`
- `GET /api/competicao/jogos?campeonatoId=...`
- `GET /api/competicao/jogos/desempates-pendentes?campeonatoId=...`
- `POST /api/competicao/jogos`
- `PATCH /api/competicao/jogos/{id}/iniciar`
- `PATCH /api/competicao/jogos/{id}/resultado`
- `PUT /api/competicao/jogos/{id}/sumula`
- `POST /api/competicao/jogos/{id}/correcoes/resultado`
- `POST /api/competicao/jogos/{id}/correcoes/sumula`

### Ainda faltando para evoluir a experiencia operacional e de produto

- bloqueios guiados replicados nas telas restantes;
- consultas ainda mais refinadas de jogos no backend, se quisermos reduzir filtragem local;
- OpenAPI/Swagger;
- migracoes versionadas;
- perfil real de producao com banco dedicado;
- autenticacao e autorizacao.

## Progresso estimado

### Em relacao ao ponto anterior desta retomada

- Frontend no encerramento de 2026-05-17:
  - aproximadamente 72% a 82%.
- Frontend agora:
  - aproximadamente 82% a 90%.
- Backend antes desta retomada:
  - aproximadamente 65% a 75%.
- Backend agora:
  - aproximadamente 80% a 88%.
- Produto como um todo antes:
  - aproximadamente 66% a 76%.
- Produto como um todo agora:
  - aproximadamente 78% a 85%.

### Leitura pratica do momento atual

- A Sprint 1 esta concluida.
- A Sprint 2 ficou praticamente fechada.
- O projeto saiu de uma fase de destravar telas e passou a entrar em fase de consolidacao de experiencia, padronizacao e preparacao mais seria para uso real.

## Melhorias futuras recomendadas

### P1 - Sprint 3

1. Replicar o padrao de bloqueio guiado nas demais telas dependentes:
   - jogos;
   - grupos;
   - fluxos de sumula;
   - demais formularios com precondicao funcional.

2. Padronizar UX do frontend:
   - componentes compartilhados;
   - feedback de erro padronizado;
   - estados vazios;
   - wrappers de formulario;
   - padrao visual para metricas, listas e paineis.

3. Reduzir duplicacao entre telas e servicos onde ja existe padrao repetido.

4. Refinar o painel operacional:
   - visao mais explicita de pendencias;
   - destaque para partidas em andamento;
   - possiveis atalhos contextuais por status.

### P2 - Sprint 4

5. Adicionar documentacao OpenAPI/Swagger.

6. Preparar perfil `prod` com Postgres e migracoes versionadas.

7. Adicionar autenticacao e autorizacao.

8. Revisar fluxo de deploy e operacao.

## Proximo passo sugerido

O proximo passo tecnico mais coerente agora e entrar de fato na Sprint 3: padronizar a experiencia do frontend, replicar bloqueios guiados nas telas restantes e reduzir duplicacao de componentes e fluxos. O volume funcional principal do sistema ja esta forte; agora o maior ganho vem de consistencia, clareza operacional e preparacao do produto para uma fase mais madura.
