# Contribuindo com o Security Test Lab

Obrigado por ajudar a construir uma ferramenta de segurança simples, reproduzível e responsável. Este projeto aceita melhorias no app Android, documentação, testes determinísticos e futuros módulos do núcleo desktop.

## Antes de começar

Trabalhe somente com projetos próprios ou com autorização explícita. Nunca publique tokens, chaves, dados pessoais, dumps, URLs privadas ou evidências que revelem credenciais. Testes ativos, carga e exploração devem ter escopo, limites e autorização documentados.

## Mudanças recomendadas

Prefira Pull Requests pequenos e focados. Um novo teste deve ser modular, ter um ID estável, categoria, severidade, descrição, requisitos, timeout, evidência redigida e recomendação de correção. Um teste com erro não pode interromper a execução dos demais.

## Desenvolvimento

```bash
pnpm install
pnpm check
npx expo export --platform web
```

Para mudanças visuais, inclua uma descrição do fluxo testado. Para mudanças no relatório, atualize os exemplos e verifique que segredos aparecem sempre redigidos.

## Pull Requests

Descreva o problema, a solução, os arquivos alterados, como validou a mudança e quais limitações permanecem. Não inclua artefatos de build, `node_modules` ou arquivos locais de configuração.

## Código de conduta

Mantenha discussões técnicas, respeitosas e orientadas à segurança defensiva. Relatos de vulnerabilidades do próprio projeto não devem ser publicados com detalhes exploráveis; procure os mantenedores por uma Issue privada ou canal apropriado.
