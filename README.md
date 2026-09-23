# PLANEAMENTO - MAQUINAÇÃO · V2.2.9

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
- O snapshot passa a `version: 224` e continua compatível com os dados existentes.
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


## V2.2.3 — Exportação do Gantt para Excel
- Novo botão **Exportar Gantt** junto de **Pesquisa**.
- Exporta o período atualmente visível (2, 4 ou 6 semanas).
- O ficheiro `.xlsx` inclui a folha **Gantt**, com máquinas nas linhas, calendário por dia/hora e cores dos estados, e uma folha **Detalhe** com os dados das produções visíveis.
- Sábados, domingos e datas não produtivas ficam diferenciados no Excel.
- A exportação usa ExcelJS carregado por CDN apenas quando a página abre; o restante funcionamento da aplicação não depende deste módulo.


## V2.2.5 — Pesquisa universal e Resumo por máquina em PDF
- A janela **Pesquisa** passa a ter uma única caixa de pesquisa.
- O mesmo campo filtra por **OF, código da peça, nome/designação da peça ou máquina**.
- A pesquisa é parcial: por exemplo, `UMC750` encontra UMC750-1, UMC750-2 e UMC750-3.
- Novo botão **Resumo por máquina** junto da Pesquisa.
- Permite escolher **data inicial, data final e uma ou várias máquinas**.
- Inclui botões **Selecionar todas** e **Limpar seleção**.
- O PDF é gerado em **A4 horizontal** e, para cada máquina selecionada, apresenta:
  - listagem das produções no período (OF, peça, designação, OP, quantidade, início, fim, estado e operadores);
  - mini-Gantt imediatamente abaixo da listagem.
- O mini-Gantt mantém a leitura por dias, diferencia fins de semana e usa as cores dos estados do planeamento.
- O PDF pode incluir várias máquinas na mesma página sempre que houver espaço; cria novas páginas automaticamente.
- Período máximo do resumo: 62 dias, para manter a leitura do Gantt.
- A geração do PDF usa jsPDF + AutoTable carregados por CDN.
- **Não é necessário SQL novo.**


## Novidades V2.2.5
- Registo de ausências de colaboradores por data/turno, com substituto opcional por máquina afetada; o Gantt recalcula a capacidade e os fins previstos.
- Pesquisa rápida na janela **Nova produção** por código, designação, cliente ou operação, mantendo a compatibilidade da máquina.
- Navegação do Gantt semana a semana: **Semana anterior · Hoje · Semana seguinte**, mantendo o horizonte de 2/4/6 semanas.


## Novidades V2.2.7 — Carga de Colaboradores
- Novo separador **Carga Colaboradores**.
- Escolha de período e, opcionalmente, de um colaborador.
- Identifica períodos em que o mesmo colaborador está atribuído simultaneamente a 2 ou mais máquinas.
- Situações com 2–3 máquinas aparecem como partilha normal de operador.
- Situações com **mais de 3 máquinas** ficam destacadas como **ATENÇÃO**.
- A tabela mostra colaborador, data, intervalo horário, número de máquinas, máquinas e OFs/operações envolvidas.
- Considera o planeamento efetivo, turnos, ausências e substituições registadas.
- Não requer novo SQL; continua a usar `app_state`.


## V2.2.7
- Ausências de colaboradores podem agora ser registadas por intervalo de datas (Data início / Data fim).
- Mantém compatibilidade com ausências antigas de um único dia.
- As máquinas afetadas são calculadas considerando todo o período da ausência.
- O Gantt recalcula a capacidade em todos os dias do intervalo.


## V2.2.9 — Correção global da fila das máquinas

- Corrigida a regressão em que uma barra podia aumentar e sobrepor-se à produção seguinte.
- A correção aplica-se a **todas as máquinas e recursos**.
- Sempre que uma produção cresce, a aplicação verifica a fila da máquina e empurra as produções seguintes apenas o necessário para eliminar sobreposições.
- A regra aplica-se a aumentos provocados por interrupções, ausências, alteração de quantidade, tempo por peça ou setup.
- Durante uma interrupção ativa, a fila é revalidada periodicamente para acompanhar o crescimento da barra em tempo real.
- Mantém-se a regra anterior: se uma produção encurtar, as seguintes **não são puxadas automaticamente para trás**.
- Não requer alterações SQL no Supabase.


## V2.2.9 — atraso real em produção
- Vermelho sólido passa a significar produção programada que já devia ter iniciado mas ainda não iniciou.
- Uma produção Em produção que ultrapasse o fim previsto mantém a parte planeada na cor normal e acrescenta um segmento vermelho tracejado para o tempo adicional.
- O segmento de atraso cresce enquanto a produção continuar em curso e deixa de crescer quando é concluída.
- Ao concluir com fim real posterior ao previsto, o segmento vermelho tracejado fica registado visualmente até ao fim real.
- O tempo adicional de ocupação empurra automaticamente todas as produções seguintes da mesma máquina.
- A regra é aplicada a todas as máquinas/recursos e mantém a regra anterior: encurtar uma produção não puxa automaticamente as seguintes para trás.
