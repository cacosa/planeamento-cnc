# PLANEAMENTO - MAQUINAÇÃO · V2.2.2

## Novidade principal — Sequências permitidas por peça

Na edição da peça, depois de criar as operações, existe agora a área **Sequências permitidas — exceções**.

- Se não for criada nenhuma sequência, mantém-se a regra geral: cada operação pode iniciar **1 hora após o início da operação anterior**.
- Quando uma peça tem um processo especial, pode adicionar uma ou mais sequências permitidas.
- O número de posições de cada sequência é criado automaticamente conforme o número de operações existentes na peça.
- Cada posição é uma lista suspensa com as operações dessa peça; não é necessário escrever OP1, OP2, etc.
- A mesma operação não pode aparecer duas vezes na mesma sequência.
- Não são permitidas sequências duplicadas.

Exemplo com quatro operações:
- OP1 > OP2 > OP3 > OP4
- OP1 > OP3 > OP2 > OP4

A aplicação aceita a programação se a operação respeitar pelo menos uma das sequências permitidas.

### Edição de produção
- Corrigida a validação para não bloquear uma edição quando não se altera a operação, a OF ou a data/hora de início.
- Por exemplo, é possível editar apenas **Trabalhar aos sábados disponíveis** sem a aplicação voltar a bloquear a produção pela regra de sequência.

## Mantido da V2.2.1
- Tornos convencionais no Gantt e em Máquinas / grupos.
- Início real da produção e alerta de início não confirmado.
- Quantidade final produzida e quantidade rejeitada/sucata no fim da produção.
- Confirmação antes de eliminar uma produção do Gantt.
- Confirmação antes de eliminar uma peça com produções associadas.
- Gantt com posicionamento horário e sem sobreposição.
- Interrupções aumentam a duração real da barra e empurram as produções seguintes.
- Fins de semana respeitados pelo cálculo e pela representação visual.
- Barras programadas alternam azul claro / azul escuro; atrasadas vermelho; concluídas cinzento; interrompidas laranja.
- Alertas de acessórios e relatório dimensional/CMM.

## Dados / Supabase
- Continua a usar `public.app_state`.
- **Não é necessário executar SQL novo.**
- O snapshot passa a `version: 222` e continua compatível com os dados existentes.
- Antes da atualização, fazer sempre Backup pela aplicação.

## Publicação
Substituir no GitHub Pages:
- `index.html`
- `style.css`
- `app.js`
- `config.js`
- `fabcast-logo.png`
- `README.md`

Depois fazer commit, aguardar a publicação e atualizar a página.

## Testes recomendados
1. Abrir uma peça existente sem sequências e confirmar que continua a usar a regra geral.
2. Numa peça com quatro operações, adicionar duas sequências permitidas e guardar.
3. Reabrir a peça e confirmar que as sequências ficaram guardadas.
4. Programar a mesma OF respeitando cada uma das sequências alternativas.
5. Tentar repetir uma operação na mesma sequência e confirmar que o sistema bloqueia.
6. Editar apenas **Trabalhar aos sábados disponíveis** numa produção já programada e confirmar que a edição não é bloqueada pela sequência.
