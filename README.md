# Planeamento CNC V1.8 — Supabase

Esta versão mantém a interface da V1.7 e sincroniza o estado da aplicação com o Supabase.

## Antes de publicar
1. Executar `supabase_patch_v1_8.sql` no SQL Editor do projeto Supabase.
2. Confirmar `Success`.
3. Substituir no GitHub os ficheiros `index.html`, `style.css`, `app.js` e `config.js`.
4. Fazer Commit.
5. Abrir a aplicação em casa primeiro. Na primeira abertura, se o Supabase ainda estiver vazio, a aplicação envia automaticamente os dados locais existentes deste navegador.
6. Quando aparecer `Supabase ligado`, abrir noutro dispositivo/computador e confirmar que aparecem os mesmos dados.

## Importante
Para o teste, a aplicação continua a guardar uma cópia no localStorage como recuperação, mas a fonte partilhada é o Supabase.
As políticas atuais são temporárias e sem login. Depois do teste deve ser adicionada autenticação.
