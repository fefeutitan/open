#  Sistema de Gerenciamento de Campeonato de Luta – Formato Copa

##  Visão Geral

Sistema desenvolvido para automatizar, organizar e dar confiabilidade ao controle de campeonatos de luta no formato copa. Substitui integralmente o processo atual baseado em planilha eletrônica, reduzindo atividades manuais, erros operacionais e retrabalho.

---

##  Problema Atual

O campeonato é gerenciado manualmente via planilha, o que exige:

- Lançamento manual de resultados
- Conferência constante de pontuação
- Aplicação manual de critérios de desempate
- Dificuldade de rastrear histórico e evolução do campeonato

Esse modelo se torna cada vez mais complexo conforme o número de atletas, categorias e fases aumenta.

---

##  Objetivo

Desenvolver um sistema que:

- Centralize todas as informações do campeonato
- Automatize o registro de lutas e resultados
- Calcule pontuações e classificações automaticamente
- Aplique regras e critérios de desempate de forma consistente
- Suporte todas as fases da competição, da fase de grupos à final

---

##  Escopo do Sistema

### Cadastro

Gerenciamento estruturado de:

- Atletas
- Categorias
- Núcleos ou equipes
- Configurações do campeonato (formato, fases e grupos)

### Gestão de Jogos

- Organização dos confrontos da fase de grupos
- Registro de jogos conforme o calendário
- Relacionamento de cada jogo com atletas, rodada e fase

### Registro de Resultados (Súmulas)

- Cada luta é avaliada por **três juízes**
- O sistema consolida automaticamente o resultado final da luta
- Garante rastreabilidade e padronização em substituição à aba de Súmulas da planilha

---

##  Regras de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Vitória   | 3      |
| Empate    | 1      |
| Derrota   | 0      |

A pontuação é atribuída automaticamente com base na consolidação das avaliações dos três juízes.

---

##  Fase de Grupos

- Os atletas acumulam pontos a cada luta
- O sistema calcula a classificação do grupo automaticamente
- Em caso de empate na pontuação, critérios de desempate são aplicados conforme o regulamento

---

##  Fase Eliminatória (Mata-mata)

A partir das oitavas de final, o campeonato passa a ser eliminatório:

- Empate definitivo **não é permitido**
- Lutas encerradas empatadas resultam na realização automática de um **terceiro jogo**
- O vencedor avança para a próxima fase

---

##  Benefícios Esperados

- Maior organização e controle do campeonato
- Redução de erros manuais
- Agilidade na apuração de resultados
- Transparência na classificação e nos critérios de desempate
- Facilidade de manutenção e reutilização do formato de campeonato

---

##  Evolução Futura

O sistema funcionará como a fonte oficial de dados do campeonato e oferece base sólida para expansões futuras, como:

- Relatórios detalhados
- Histórico de atletas
- Suporte a novos campeonatos
