# PLANEAMENTO - MAQUINAÇÃO · V2.2

## Novidades da V2.2

### Sequência entre operações
- A operação seguinte já não precisa de esperar pelo fim completo da operação anterior.
- Para a mesma OF, **OP2 pode começar 1 hora depois do início de OP1**, OP3 uma hora depois do início de OP2, e assim sucessivamente.
- Se a operação anterior já tiver um início real confirmado, esse início real é a referência; caso contrário usa-se o início previsto.

### Novo posto: Tornos convencionais
- Novo recurso **Tornos convencionais** no Gantt.
- Novo grupo de compatibilidade `TORNOS_CONVENCIONAIS`.
- Em **Peças / Tempos → Editar peça → Máquinas / grupos**, passa a aparecer **Tornos convencionais**.
- Pode ser usado como operação de preparação antes de SL30 ou V8300, ou como qualquer outro posto compatível.

### Início real da produção
- Novo botão **Iniciar produção**.
- Ao iniciar, a aplicação propõe a data/hora atual, mas permite corrigir manualmente.
- Passam a existir **início previsto** e **início real**.
- Quando a hora prevista chega e a produção continua programada sem início confirmado, é criado um alerta **“Início de produção não confirmado”** no sino.
- O alerta pode ser marcado como **Lido**.

### Fim de produção e quantidade final
- Ao concluir uma produção é obrigatório confirmar a **quantidade final produzida**.
- Pode também indicar **quantidade rejeitada / sucata**.
- É guardada a data/hora real de fim.
- A Pesquisa passa a mostrar quantidade programada, quantidade final, início previsto, início real, fim previsto e fim real.

### Eliminar peça com confirmação
- Continua a ser possível eliminar uma peça.
- Se a peça tiver produções associadas, aparece uma mensagem de confirmação indicando quantas programações serão eliminadas.
- Só depois da confirmação são removidas a peça, operações e programações relacionadas.

### Correção de fins de semana no Gantt
- Corrigida a regressão em turnos que atravessam a meia-noite.
- Se sábado não estiver autorizado para a OF, uma produção iniciada na sexta-feira não prolonga visualmente o turno para sábado.
- Domingos continuam sempre sem produção.
- Sábados só são usados quando estão disponíveis no Calendário **e** autorizados nessa produção.

### Mantido da V2.1.2
- Gantt dividido por dias com posicionamento de hora em hora.
- Proibição de sobreposição de barras na mesma máquina.
- Interrupções aumentam a duração real da barra pelo tempo útil perdido.
- As produções seguintes são empurradas quando necessário.
- Barras programadas alternam azul escuro / azul claro.
- Atrasadas: vermelho; concluídas: cinzento; interrompidas: laranja.
- Alertas de acessórios e relatório dimensional/CMM.

## Dados / Supabase
- Continua a usar `public.app_state`.
- **Não é necessário executar SQL novo.**
- O formato do snapshot passa a `version: 220` e continua compatível com os dados da V2.1.2.
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
1. Confirmar peças, OFs, máquinas, colaboradores e alertas existentes.
2. Confirmar a nova linha **Tornos convencionais** e a respetiva opção em Editar peça.
3. Criar OP1 e OP2 da mesma OF e verificar que OP2 pode começar uma hora depois do início de OP1.
4. Testar **Iniciar produção**, corrigindo a hora real.
5. Deixar uma produção prevista sem início confirmado e verificar o alerta.
6. Concluir uma produção e introduzir quantidade final e rejeitada.
7. Testar uma produção de sexta-feira com sábado não autorizado e confirmar que a barra não entra no sábado.
8. Testar eliminar uma peça programada e confirmar que aparece a mensagem de segurança.
