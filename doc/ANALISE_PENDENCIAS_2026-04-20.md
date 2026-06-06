# An�lise pend�ncias do projeto Open (2026-04-20)

## Bloqueadores
- Build n�o compila no ambiente atual porque o Maven est� usando Java 8, enquanto o projeto usa `record` e Spring Boot 4.
- A��o pendente: ajustar `JAVA_HOME` para JDK compat�vel (m�nimo 17, ideal alinhado ao Boot 4).

- Observação no dia seguinte dessa interação eu mudei o ambiente pro java 21 java -version mvn -version

## Regras de neg�cio ainda faltando
- Fluxo de s�mula com 3 ju�zes ainda n�o implementado de ponta a ponta (dom�nio existe, mas faltam servi�o/endpoints/reposit�rios espec�ficos de opera��o).
- Empate n�o est� modelado no fluxo atual:
  - README prev� 1 ponto para empate na fase de grupos.
  - README prev� 3� jogo autom�tico no mata-mata quando houver empate.
  - Implementa��o atual exige vencedor sempre e s� pontua vit�ria (3 pontos).

## Qualidade e cobertura
- Testes ainda limitados (contexto + 1 cen�rio principal de competi��o).
- Faltam testes para empate, crit�rios de desempate, valida��es e fluxo de s�mula.

## Produ��o e opera��o
- Configura��o atual usa H2 em mem�ria e `ddl-auto=update`.
- Faltam perfil de produ��o (Postgres), migra��o de schema e ajustes de deploy.
- API cobre cadastro/listagem e parte da competi��o, mas faltam endpoints de ciclo de vida completo (status, edi��o/corre��o completa, opera��o de s�mula).

## Pr�xima retomada sugerida
1. Corrigir ambiente Java e validar `mvnw test`.
2. Implementar regra de empate (grupos + mata-mata com 3� jogo).
3. Implementar fluxo completo de s�mula com 3 ju�zes.
4. Ampliar testes automatizados.
5. Preparar configura��o de produ��o.
