# Analise de pendencias do projeto Open (2026-05-08)

## Resumo da retomada

Nesta retomada, o backend deixou de ser apenas um fluxo de cadastro/resultado e ganhou controles operacionais importantes para uso real: ciclo de vida de jogo, bloqueio de alteracoes silenciosas em jogos finalizados e fluxo de correcao auditada. Tambem foi criado o primeiro esqueleto do frontend Angular dentro do proprio repositorio.

O projeto esta em bom estado para evoluir como MVP de API. A estimativa atual e:

- Backend MVP: aproximadamente 75%.
- Backend pronto para producao: aproximadamente 55% a 60%.
- Sistema completo com frontend, seguranca, deploy e operacao: aproximadamente 40% a 45%.

## O que foi feito em 2026-05-08

### Validacao do ambiente

- Confirmado Java 21 disponivel no ambiente.
- `mvn test` validado com Maven global usando o repositorio local `.m2repo`.
- Observacao: `mvnw.cmd` ainda apresenta problema no script do wrapper no PowerShell, mas o Maven global funciona com Java 21.

### Ciclo de vida do jogo

- Criada operacao de inicio de jogo:
  - `PATCH /api/competicao/jogos/{jogoId}/iniciar`
- Regra implementada:
  - somente jogo `AGENDADO` pode ir para `EM_ANDAMENTO`.
  - resultado so pode ser registrado em jogo `EM_ANDAMENTO`.
  - sumula so pode ser registrada em jogo `EM_ANDAMENTO`.
  - ao registrar resultado ou sumula, o jogo passa para `FINALIZADO`.
- Isso evita alteracoes silenciosas em jogos ja finalizados.

### Correcao auditada

- Criada entidade `CorrecaoJogo`.
- Criado enum `TipoCorrecaoJogo` com:
  - `RESULTADO`
  - `SUMULA`
- Criado `CorrecaoJogoRepository`.
- Criados DTOs:
  - `CorrecaoResultadoJogoRequest`
  - `CorrecaoSumulaJogoRequest`
  - `CorrecaoJogoResponse`
- Criados endpoints:
  - `POST /api/competicao/jogos/{jogoId}/correcoes/resultado`
  - `POST /api/competicao/jogos/{jogoId}/correcoes/sumula`
- Regras implementadas:
  - apenas jogos `FINALIZADO` podem ser corrigidos.
  - motivo da correcao e obrigatorio.
  - auditoria guarda tipo, motivo, detalhe anterior e detalhe novo.
  - correcao de sumula recalcula placar total e vencedor.
  - correcao de resultado em eliminatoria preserva a regra de gerar desempate quando o novo resultado for empate.

### Testes

- Testes ampliados para cobrir:
  - inicio de jogo agendado.
  - rejeicao de resultado fora de jogo em andamento.
  - rejeicao de sumula fora de jogo em andamento.
  - correcao auditada de resultado.
  - correcao auditada de sumula.
- Resultado da suite:
  - `mvn test`
  - 11 testes executados.
  - 0 falhas.
  - build com sucesso.

### Frontend Angular

- Criado projeto Angular dentro da pasta `app/`.
- Angular criado na versao 21.x:
  - `@angular/core` 21.2.x
  - `@angular/cli` 21.2.x
- Criado `app/proxy.conf.json` para redirecionar `/api` para `http://localhost:8080`.
- Ajustado `npm start` para usar o proxy.
- Substituida tela inicial padrao do Angular por um painel base do sistema:
  - menu lateral.
  - resumo operacional.
  - area de fila de jogos.
  - acoes rapidas.
- Build Angular validado:
  - `npm run build`
  - build com sucesso.
- Servidor de desenvolvimento validado em:
  - `http://127.0.0.1:4200`

## Estado atual do backend

### Pronto ou bem encaminhado

- Cadastro de campeonatos.
- Cadastro de categorias.
- Cadastro de nucleos.
- Cadastro de atletas.
- Cadastro de juizes.
- Criacao de fases.
- Criacao de grupos.
- Criacao de jogos.
- Classificacao de grupo.
- Geracao de mata-mata.
- Registro de resultado.
- Registro de sumula com 3 juizes.
- Empate em fase de grupos.
- Jogo de desempate em fase eliminatoria.
- Ciclo de vida basico do jogo.
- Correcao auditada de resultado e sumula.
- Testes de integracao cobrindo os fluxos principais.

### Pontos de atencao

- O tratamento de `IllegalArgumentException` ainda retorna 404 para muitos erros que sao regra de negocio e deveriam ser 400 ou 409.
- O Maven Wrapper (`mvnw.cmd`) ainda precisa ser revisado.
- O projeto usa H2 em memoria no perfil atual e `ddl-auto=update`.
- Ainda nao ha autenticacao/autorizacao.
- Ainda nao ha migracoes versionadas de banco.
- Ainda nao ha documentacao OpenAPI/Swagger.

## Melhorias futuras recomendadas

### P1 - Operacao do campeonato

1. Criar consultas operacionais de jogos:
   - filtrar por campeonato.
   - filtrar por fase.
   - filtrar por grupo.
   - filtrar por categoria.
   - filtrar por status.
   - filtrar por data.

2. Criar endpoint para listar desempates pendentes:
   - por campeonato.
   - por fase.
   - por categoria.

3. Melhorar consistencias ao criar jogo:
   - validar que fase e categoria pertencem ao mesmo campeonato.
   - validar que atletas pertencem a categoria do jogo.
   - validar que grupo pertence a fase informada.
   - impedir atleta contra ele mesmo.
   - avaliar bloqueio de jogos duplicados.

4. Melhorar tratamento de erros:
   - separar recurso nao encontrado de regra de negocio.
   - usar 400 para entrada invalida.
   - usar 409 para conflito de estado.
   - manter 404 apenas para recurso inexistente.

### P1 - Frontend

5. Conectar o Angular aos endpoints reais:
   - listar campeonatos.
   - listar jogos.
   - iniciar jogo.
   - registrar resultado.
   - registrar sumula.
   - consultar classificacao.

6. Criar servicos Angular para API:
   - `CampeonatoApiService`.
   - `CompeticaoApiService`.
   - `CadastroApiService`.

7. Criar telas iniciais:
   - painel operacional.
   - cadastro de atletas.
   - cadastro de juizes.
   - gestao de jogos.
   - sumulas.
   - classificacao por grupo.

### P2 - Preparacao para producao

8. Criar perfil `prod` com Postgres.

9. Adicionar Flyway ou Liquibase:
   - substituir dependencia em `ddl-auto=update`.
   - versionar schema.
   - criar constraints e indices.

10. Adicionar autenticacao e autorizacao:
    - admin.
    - operador.
    - juiz.
    - leitura/publico.

11. Adicionar OpenAPI/Swagger:
    - documentar endpoints.
    - facilitar testes manuais.

12. Revisar regras oficiais do regulamento:
    - criterios de desempate em grupo.
    - regras de avanco no mata-mata.
    - regra exata do terceiro jogo/desempate.
    - criterios de classificacao por categoria.

### P3 - Produto e expansoes

13. Relatorios:
    - historico de atleta.
    - tabela de classificacao.
    - chaveamento.
    - exportacao CSV/PDF.

14. Observabilidade:
    - logs estruturados.
    - metricas.
    - rastreamento basico de erros.

15. Fantasy do campeonato:
    - modulo separado no futuro.
    - usuarios montam times de atletas.
    - pontuacao baseada nos resultados oficiais.
    - ranking por campeonato, categoria ou fase.
    - travamento de escolhas antes do inicio dos jogos.

## Proximo passo sugerido

O proximo passo tecnico mais util e implementar as consultas operacionais de jogos e desempates pendentes. Isso vai permitir que o frontend Angular comece a consumir dados reais e transforme o sistema em uma ferramenta de operacao do campeonato, nao apenas uma API de cadastro e registro.
