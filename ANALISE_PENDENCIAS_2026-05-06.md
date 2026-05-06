# Analise de pendencias do projeto Open (2026-05-06)

## ANALISE DE RETOMADA DO PROJETO

Nao parece faltar “muita coisa” para um **MVP de API** (cadastro + competicao basica), mas ainda falta um bloco consideravel para virar um sistema **operacional/produçao** (rodando com segurança, dados persistentes, processos de operacao e regras fechadas).

O que ja existe cobre bem o fluxo principal: cadastro dos dados, estrutura de competicao (fases/grupos/jogos), classificacao, geracao de mata-mata, registro de resultado e fluxo de sumula com 3 juizes. Isso indica que o “core” do sistema esta encaminhado.

Por outro lado, ao tentar validar o build no ambiente atual, o `mvnw test` falhou porque o Maven esta rodando com **Java 8** (class file 52), enquanto o projeto exige **Java 21** (class file 61), coerente com Spring Boot 4 e dependencias de teste. Entao, antes de qualquer retomada, e necessario alinhar o `JAVA_HOME`/JDK da execucao do Maven para conseguir rodar testes e evoluir com confiabilidade.

Em termos de “terminar o sistema”, a diferenca entre um MVP e um produto pronto esta principalmente em:
- **Operacao completa** (ciclo de vida do jogo, correcao com auditoria, listagens e consultas de apoio).
- **Regras de negocio fechadas** (criterios de desempate do regulamento, consistencias e restricoes).
- **Pronto para producao** (Postgres + migracoes, perfis, deploy e observabilidade).

## O QUE FOI FEITO (ATÉ AGORA)

### Estrutura e stack
- Projeto **Spring Boot 4.0.2** com **Java 21** definido no `pom.xml` (release 21).
- Persistencia via **Spring Data JPA**.
- Banco em desenvolvimento configurado como **H2 em memoria** (`application.properties`) com `ddl-auto=update`.
- Tratamento basico de erros em `RestExceptionHandler` com `ProblemDetail` (400 para validacao, 404 para recursos nao encontrados via `IllegalArgumentException`).

### APIs (endpoints) implementadas
- `CampeonatoController`:
  - `GET /api/campeonatos`
  - `GET /api/campeonatos/{id}`
  - `POST /api/campeonatos`
- `CadastroController` (cadastros base):
  - `GET/POST /api/cadastros/categorias`
  - `GET/POST /api/cadastros/nucleos`
  - `GET/POST /api/cadastros/atletas`
  - `GET/POST /api/cadastros/juizes`
- `CompeticaoController` (competicao):
  - `GET/POST /api/competicao/fases`
  - `GET/POST /api/competicao/grupos`
  - `GET /api/competicao/grupos/{grupoId}/classificacao`
  - `GET/POST /api/competicao/jogos`
  - `PATCH /api/competicao/jogos/{jogoId}/resultado`
  - `PUT /api/competicao/jogos/{jogoId}/sumula`
  - `GET /api/competicao/jogos/{jogoId}/sumula`
  - `POST /api/competicao/fases/{faseGruposId}/gerar-mata-mata`

### Regras de negocio entregues (principal)
- Classificacao de grupos com pontuacao:
  - vitoria = 3, derrota = 0, empate = 1 (quando `vencedor = null`).
  - ordenacao atual: pontosClassificacao, vitorias, saldo, pontos marcados, nome.
- Registro de resultado com validacoes de consistencia:
  - placar empatado exige `vencedor = null`.
  - placar diferente exige `vencedor` coerente com o lado vencedor.
- Mata-mata:
  - geracao de confrontos a partir dos classificados da fase de grupos.
  - em fase ELIMINATORIA, empate no resultado cria automaticamente um **jogo de desempate** (protecao para nao duplicar pendente).
- Fluxo de sumula com 3 juizes (ponta a ponta):
  - exige exatamente 3 avaliacoes, impede juiz repetido, valida juiz no mesmo campeonato do jogo.
  - consolida automaticamente placar total e vencedor por maioria de votos.
  - finaliza o jogo ao registrar sumula.

### Testes
- Testes de integracao (`@SpringBootTest`) cobrindo:
  - classificacao + geracao de mata-mata.
  - pontuacao de empate em grupos.
  - geracao de jogo de desempate em eliminatoria.
  - registro de sumula com 3 juizes e validacao de juiz duplicado.

## PENDÊNCIAS IMEDIATAS (PRÓXIMOS PASSOS)

### P0 (bloqueador de retomada)
1. **Padronizar o JDK do Maven**:
   - garantir que `.\mvnw.cmd -v` use **Java 21** (hoje esta usando Java 8).
   - ajustar `JAVA_HOME` e/ou configuracao do wrapper/IDE para nao cair no JDK 1.8.

### P1 (para operacao do campeonato sem “gambiarras”)
2. **Ciclo de vida do jogo**:
   - criar operacoes/endpoints para transicionar `AGENDADO -> EM_ANDAMENTO -> FINALIZADO`.
   - definir regras: quando pode iniciar, quando pode encerrar, e se pode reabrir/corrigir.
3. **Correcao/auditoria**:
   - definir como corrigir resultado/sumula com trilha (quem, quando, motivo).
   - impedir alterações silenciosas em jogos ja finalizados sem justificativa.
4. **Consultas operacionais**:
   - endpoint para **listar jogos de desempate pendentes** por fase/campeonato.
   - filtros de listagem (por fase, grupo, status, categoria, data).
5. **Regras e consistencias adicionais**:
   - validar consistencia de campeonato/categoria/atletas ao criar jogo (evitar cruzar campeonatos/categorias por engano).
   - revisitar criterios de desempate: confirmar se a ordenacao implementada bate com o regulamento real.

### P2 (preparacao minima para producao)
6. **Perfil `prod` + Postgres**:
   - criar `application-prod.properties` (ou YAML) com datasource Postgres.
   - substituir `ddl-auto=update` por migracoes de schema (Flyway/Liquibase).
   - revisar indices/constraints.

## MELHORIAS FUTURAS (IDEIAS)

- **Documentacao de API (OpenAPI/Swagger)** para facilitar consumo e testes manuais.
- **Autenticacao e autorizacao** (perfis: admin, operador, juiz, leitura).
- **Relatorios e historico**:
  - historico por atleta, chaveamento e evolucao do campeonato.
  - exportacao (PDF/CSV) e dashboards simples.
- **Observabilidade**:
  - logs estruturados, metricas e rastreamento basico de erros.
- **Melhorar o modelo de desempates**:
  - explicitar que jogo e “desempate” (vincular ao jogo original) para consultas e exibicao.
- **Validacoes e UX de operacao**:
  - impedir criacao de jogos duplicados, conferir datas/horarios, e verificacoes de integridade.

## ANALISE DE PENDENCIAS ANTERIORES

Base: `ANALISE_PENDENCIAS_2026-04-20.md`, `ANALISE_PENDENCIAS_2026-04-22.md`, `ANALISE_PENDENCIAS_2026-04-23.md`.

### O que foi coberto desde 2026-04-20
- **Fluxo de sumula com 3 juizes**: era pendencia em 2026-04-20 e foi entregue em 2026-04-22 (servico, repositorios, endpoints, DTOs e testes).
- **Regra de empate**:
  - empate em grupos com 1 ponto para cada atleta: entregue em 2026-04-23.
  - mata-mata com criacao automatica de jogo de desempate: entregue em 2026-04-23 (com protecao contra duplicidade).
- **Cobertura de testes**: foi ampliada (de poucos testes para cenarios de sumula e empate/desempate).

### O que ainda falta (e continua coerente com as analises anteriores)
- **Ciclo de vida operacional dos jogos** (iniciar/encerrar/corrigir com auditoria): ainda pendente (ja citado em 2026-04-22/23).
- **Endpoints de apoio operacional**:
  - listar desempates pendentes (sugerido em 2026-04-23): ainda pendente.
- **Criterios de desempate do regulamento**:
  - ha uma ordenacao implementada, mas precisa ser confirmada contra o regulamento real (as analises antigas falavam em “criterios de desempate” de forma generica).
- **Preparacao de producao**:
  - perfil `prod`, Postgres, migracoes de schema, revisao de `ddl-auto`: ainda pendente (citado desde 2026-04-20).
- **Higienizacao do repositorio/workspace**:
  - checar se `.m2repo` deve ser versionado/mantido como parte do projeto (ponto levantado em 2026-04-22).

### Observacao importante (mudanca em relacao ao que estava “ok” em 2026-04-23)
- Em 2026-04-23 foi registrado que o build foi validado com Java 21.
- Em 2026-05-06, no ambiente atual, `.\mvnw.cmd -v` esta usando Java 8, e por isso os testes nao rodam. Isso precisa ser corrigido para retomar com seguranca.

