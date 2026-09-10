# PLANEAMENTO - MAQUINAÇÃO · V2.1.2

## Alterações principais

### Peças / Tempos
- Novo filtro único por código da peça, designação ou cliente.
- Nova opção **Requer relatório dimensional / CMM**.
- Quando uma OF de uma peça com relatório dimensional é programada:
  - é criado um alerta no sino;
  - aparece um ponto vermelho persistente no primeiro segmento visível da barra;
  - o tooltip da barra informa que o relatório dimensional é necessário;
  - ao marcar o alerta como **Lido**, o ponto vermelho desaparece, mantendo o registo no histórico da aplicação.

### Planeamento / Gantt
- Produções programadas em azul.
- Primeira produção da fila em azul médio e produções seguintes em azul claro.
- Produções atrasadas continuam a vermelho e concluídas a cinzento.
- Produções interrompidas aparecem a laranja com padrão.
- Nova opção por produção: **Trabalhar aos sábados disponíveis**.
- O sábado deixou de ser global para todas as produções: o Calendário define se o sábado está disponível e cada produção decide se o utiliza.

### Interrupções de produção
- Botão **Interromper produção** na edição da OF.
- Motivos: Falta de colaborador, Avaria, Falta de material, Aguardar controlo / CMM e Outro.
- Guarda data/hora de início, motivo e observação.
- Botão **Retomar produção** guarda a data/hora de retoma.
- A previsão é prolongada pelo tempo útil perdido durante a interrupção.
- Histórico de interrupções visível na própria produção.
- Em caso de Avaria, pode criar também um registo no histórico da máquina.

### Máquinas / Recursos
- Novos campos: Marca, Modelo, Número de série, Ano e Estado.
- Histórico de intervenções por máquina.
- Tipos: Avaria, Manutenção preventiva, Manutenção corretiva e Melhoria.
- Cada intervenção pode guardar descrição, trabalho realizado, técnico/empresa, horas de paragem e observações.

### Calendário de Produção
- Novo separador **Calendário de Produção**.
- Tipos: Feriado, Sábado, Encerramento, Férias coletivas e Outro.
- Cada data pode ser marcada como útil/disponível ou não útil.
- Domingo permanece sempre sem trabalho.
- Sábados só ficam disponíveis quando registados no calendário como dia útil.
- Sábados anteriormente ativados na V2.0 são migrados para o novo calendário como disponíveis, mas cada produção precisa da opção de sábado ativa para os usar.

### Dados / Supabase
- Continua a usar a tabela `app_state` existente.
- **Não é necessário executar novo SQL para testar a V2.1.**
- O snapshot passa a identificar `version: 21`.
- Os dados existentes são normalizados sem serem apagados.
- O botão Backup passa a identificar o ficheiro como versão 2.1.

## Publicação no GitHub Pages
Substituir os ficheiros da V2.0 pelos ficheiros desta pasta, fazer commit e aguardar a atualização do GitHub Pages.
Depois, atualizar a página com Ctrl+F5 no computador ou fechar/reabrir a página no telemóvel.

## Testes recomendados
1. Confirmar que os dados existentes aparecem normalmente.
2. Marcar uma peça como “Requer relatório dimensional / CMM” e programar uma OF.
3. Confirmar ponto vermelho na barra, tooltip e alerta no sino; marcar Lido e confirmar que o ponto desaparece.
4. Criar um sábado disponível no Calendário e comparar duas produções: uma com sábado ativo e outra sem sábado ativo.
5. Interromper uma produção, verificar barra laranja, retomar e confirmar histórico.
6. Abrir uma máquina e testar o histórico de intervenções.
7. Fazer um Backup antes de usar a V2.1 em produção diária.


## V2.1.1 — correções
- As produções programadas alternam azul escuro / azul claro na mesma máquina.
- O tempo útil perdido numa interrupção é somado à duração da produção no Gantt.
- Uma interrupção de 2 h durante horário produtivo aumenta a duração planeada em 2 h.
- Intervalos, turnos, fins de semana, feriados e sábados autorizados são respeitados no cálculo da paragem.
- Ao aumentar a duração, a fila da mesma máquina é recalculada para evitar sobreposição.


## V2.1.2 — precisão horária e interrupção no ponto da barra
- O Gantt continua dividido por dias, mas cada célula passa a aceitar posicionamento de hora em hora.
- Ao arrastar uma produção dentro de um dia, a hora é calculada pela posição horizontal e encaixa à hora inteira.
- Durante o arrasto aparece uma indicação com data e hora.
- A produção guarda `startTime`, mantendo compatibilidade com planeamentos antigos.
- Uma barra não pode ser largada sobre outra produção da mesma máquina; em conflito, a posição anterior é mantida.
- O diálogo da produção passa a mostrar também a Hora de início.
- Ao clicar numa zona concreta da barra, a aplicação memoriza a data/hora correspondente.
- Ao escolher “Interromper produção”, essa data/hora é proposta automaticamente como início da interrupção e pode ser corrigida manualmente.
- O prolongamento por interrupção continua a empurrar para a frente as produções seguintes, agora com precisão horária.
- Não é necessário novo SQL; continua a usar `app_state`.
