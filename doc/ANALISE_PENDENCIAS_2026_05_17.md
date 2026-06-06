# Analise de pendencias do projeto Open (2026-05-17)

## Resumo da retomada

Nesta retomada, o foco foi refinar a experiencia operacional do frontend ja construido, atacando um problema importante de usabilidade: formularios que dependem de cadastros anteriores precisavam deixar isso explicito e guiar o operador para o proximo passo correto.

O ganho principal do dia foi evoluir a tela de atletas para um comportamento mais coerente com o fluxo real do sistema:

- bloqueio explicito do formulario quando faltam dependencias;
- mensagem clara sobre o motivo do bloqueio;
- links diretos para as telas que precisam ser preenchidas primeiro.

Em termos de maturidade, esta foi uma entrega menor em volume, mas importante em qualidade de uso. O frontend fica menos ambíguo e mais orientado ao fluxo real de configuracao do campeonato.

To continue this session, run `codex resume 019e3130-b9ff-7191-b0e5-670591936ad1`

## O que foi feito em 2026-05-17

### Frontend Angular - bloqueio guiado por dependencias

- A tela de atletas foi ajustada para reconhecer quando o campeonato ainda nao possui:
  - categorias;
  - nucleos.
- O formulario deixou de apenas falhar por dependencia ausente e passou a se comportar como fluxo guiado.

### Tela de atletas por campeonato

- Mantida rota:
  - `/campeonatos/{id}/atletas`
- Ajustes implementados:
  - criadas computacoes explicitas para detectar ausencia de categorias e nucleos;
  - formulario passa a ficar bloqueado quando qualquer dependencia obrigatoria estiver ausente;
  - tentativa de salvar com dependencias ausentes agora retorna mensagem coerente;
  - o aviso de bloqueio passou a exibir links diretos para:
    - `/campeonatos/{id}/categorias`
    - `/campeonatos/{id}/nucleos`
- A tela agora entrega:
  - bloqueio visual do formulario;
  - orientacao de fluxo;
  - navegacao direta para destravar o cadastro de atletas.

### Ajustes de usabilidade

- O formulario de atletas agora usa `fieldset` desabilitado quando o fluxo nao pode continuar.
- O feedback de bloqueio ficou mais claro para o operador.
- A tela passou a expressar dependencia funcional em vez de deixar a regra apenas implícita.

### Validacao

- `npm run build` foi executado e validado com sucesso apos a alteracao.
- Durante a validacao no ambiente atual, o build precisou ser rerrodado fora do sandbox por restricao de leitura do proprio workspace pelo Angular compiler.
- O resultado final do build foi:
  - build com sucesso;
  - sem quebra de template ou tipagem causada pela nova regra de bloqueio.

## Estado atual do frontend

### Pronto ou bem encaminhado

- Shell base da aplicacao.
- Painel inicial estatico.
- Navegacao por campeonatos.
- Detalhe de campeonato.
- Cadastro de atletas por campeonato.
- Cadastro de categorias por campeonato.
- Cadastro de nucleos por campeonato.
- Cadastro de juizes por campeonato.
- Configuracao de fases por campeonato.
- Configuracao de grupos por fase.
- Gestao de jogos por campeonato.
- Criacao de jogos.
- Inicio de jogo.
- Registro de resultado.
- Registro de sumula.
- Correcao auditada de resultado.
- Correcao auditada de sumula.
- Bloqueio guiado de dependencias na tela de atletas.

### Pontos de atencao

- O mesmo padrao de bloqueio guiado ainda nao foi replicado nas outras telas dependentes.
- O painel principal ainda nao foi conectado a dados reais.
- Ainda nao ha fluxo frontend para classificacao de grupo.
- Ainda nao ha fluxo frontend para geracao de mata-mata.
- Ainda nao ha consulta operacional de desempates pendentes.
- Ainda nao ha padrao unificado de componentes compartilhados para formularios, feedback e estado vazio.
- O tratamento de erro exibido no frontend ainda e simples e pouco contextual.

## Estado atual do backend em relacao ao frontend

### Ja suficiente para as telas atuais

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
- `GET /api/competicao/jogos?campeonatoId=...`
- `POST /api/competicao/jogos`
- `PATCH /api/competicao/jogos/{id}/iniciar`
- `PATCH /api/competicao/jogos/{id}/resultado`
- `PUT /api/competicao/jogos/{id}/sumula`
- `POST /api/competicao/jogos/{id}/correcoes/resultado`
- `POST /api/competicao/jogos/{id}/correcoes/sumula`

### Ainda faltando para evoluir a experiencia operacional

- classificacao por grupo exposta em tela;
- geracao de mata-mata exposta em tela;
- consultas operacionais mais refinadas de jogos;
- endpoint dedicado para desempates pendentes;
- melhor semantica de erros HTTP para regras de negocio;
- validacoes mais fortes de consistencia na criacao de jogo e atleta.

## Progresso estimado

### Em relacao ao ponto anterior desta retomada

- Frontend no encerramento de 2026-05-16:
  - aproximadamente 70% a 80%.
- Frontend agora:
  - aproximadamente 72% a 82%.
- Produto como um todo no encerramento de 2026-05-16:
  - aproximadamente 65% a 75%.
- Produto como um todo agora:
  - aproximadamente 66% a 76%.

### Leitura pratica do momento atual

- O volume funcional principal do frontend continua forte.
- A melhora do dia foi de qualidade de fluxo, nao de abertura de novos modulos.
- O sistema agora orienta melhor o operador quando uma etapa depende de outra.

## Melhorias futuras recomendadas

### P1 - Frontend

1. Replicar o padrao de bloqueio guiado em outras telas dependentes:
   - jogos, quando faltarem fases;
   - jogos, quando faltarem categorias;
   - jogos, quando faltarem atletas suficientes;
   - sumula/correcao, quando faltarem juizes;
   - grupos, quando faltarem fases do tipo `GRUPOS`.

2. Conectar o painel principal a dados reais:
   - jogos do dia;
   - jogos em andamento;
   - desempates pendentes;
   - fila operacional.

3. Criar tela de classificacao por grupo:
   - consumo de `GET /api/competicao/grupos/{grupoId}/classificacao`.

4. Criar fluxo frontend para geracao de mata-mata:
   - consumo de `POST /api/competicao/fases/{faseGruposId}/gerar-mata-mata`.

5. Melhorar padrao visual e tecnico do frontend:
   - componentes compartilhados;
   - feedback de erro padronizado;
   - estados vazios;
   - formularios reutilizaveis.

### P1 - Backend de consistencia e operacao

6. Melhorar validacoes na criacao de jogo:
   - fase e categoria no mesmo campeonato;
   - atletas da categoria correta;
   - grupo pertencente a fase informada;
   - impedir atleta contra ele mesmo no backend;
   - avaliar bloqueio de jogos duplicados.

7. Melhorar validacoes no cadastro de atleta:
   - garantir coerencia entre categoria e nucleo no mesmo campeonato.

8. Melhorar tratamento de erros:
   - separar recurso inexistente de regra de negocio;
   - usar 400 para entrada invalida;
   - usar 409 para conflito de estado;
   - manter 404 apenas para entidade nao encontrada.

9. Criar endpoint de desempates pendentes.

10. Criar consultas operacionais adicionais de jogos:
   - por fase;
   - por grupo;
   - por categoria;
   - por status;
   - por data.

### P2 - Estruturacao do produto

11. Adicionar documentacao OpenAPI/Swagger.

12. Preparar perfil `prod` com Postgres e migracoes versionadas.

13. Adicionar autenticacao e autorizacao.

14. Revisar o painel e a navegacao para refletirem o fluxo real do campeonato.

## Proximo passo sugerido

O proximo passo tecnico mais util e replicar o padrao de bloqueio guiado nas demais telas dependentes e, em paralelo, endurecer o backend nas regras de consistencia e na semantica de erros HTTP. O fluxo de atletas ficou melhor resolvido; agora vale transformar essa mesma clareza em padrao do sistema inteiro.
