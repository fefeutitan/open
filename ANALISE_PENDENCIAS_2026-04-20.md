# Análise pendências do projeto Open (2026-04-20)

## Bloqueadores
- Build não compila no ambiente atual porque o Maven está usando Java 8, enquanto o projeto usa `record` e Spring Boot 4.
- Ação pendente: ajustar `JAVA_HOME` para JDK compatível (mínimo 17, ideal alinhado ao Boot 4).

## Regras de negócio ainda faltando
- Fluxo de súmula com 3 juízes ainda não implementado de ponta a ponta (domínio existe, mas faltam serviço/endpoints/repositórios específicos de operação).
- Empate não está modelado no fluxo atual:
  - README prevê 1 ponto para empate na fase de grupos.
  - README prevê 3º jogo automático no mata-mata quando houver empate.
  - Implementação atual exige vencedor sempre e só pontua vitória (3 pontos).

## Qualidade e cobertura
- Testes ainda limitados (contexto + 1 cenário principal de competição).
- Faltam testes para empate, critérios de desempate, validações e fluxo de súmula.

## Produção e operação
- Configuração atual usa H2 em memória e `ddl-auto=update`.
- Faltam perfil de produção (Postgres), migração de schema e ajustes de deploy.
- API cobre cadastro/listagem e parte da competição, mas faltam endpoints de ciclo de vida completo (status, edição/correção completa, operação de súmula).

## Próxima retomada sugerida
1. Corrigir ambiente Java e validar `mvnw test`.
2. Implementar regra de empate (grupos + mata-mata com 3º jogo).
3. Implementar fluxo completo de súmula com 3 juízes.
4. Ampliar testes automatizados.
5. Preparar configuração de produção.
