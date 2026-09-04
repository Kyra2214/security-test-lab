# Security Test Lab

Aplicativo Android open source para preparar análises de segurança autorizadas e gerar um `security-report.md` local. O MVP oferece uma interface simples para receber uma URL pública do GitHub ou um arquivo ZIP, validar a origem, percorrer um catálogo de **300 verificações em 15 categorias** e exportar o relatório.

## Escopo do MVP mobile

O Android não executa Docker Engine, scanners desktop ou testes ativos de rede de forma equivalente ao núcleo Windows planejado. Por isso, esta primeira entrega mobile mantém o fluxo seguro de preparação, seleção de ZIP, validação de URL, progresso determinístico, cobertura inicial e exportação Markdown. O runner completo com Docker, SAST/DAST e testes ativos deve ser implementado como núcleo multiplataforma/desktop, sempre com autorização explícita.

O catálogo está em `lib/test-registry.ts` e usa IDs estáveis no formato `SEC-CATEGORIA-NNN`. As categorias atuais são API, Authentication, Authorization, Secrets, Headers, CORS, Input, Files, Dependencies, Configuration, Exposure, Resilience, Stress, Web e Supply Chain, com 20 verificações em cada categoria. Os 300 registros estão conectados ao executor adversarial `scoped-probe` e passam pelo `AdversarialEngine`, que continua a campanha após cada finding.

## Primeira camada executável

O núcleo em `engine/` já contém o contrato de teste executável, o `ScopeManifest`, o `Scope Guard`, as primitivas de probe com canários redigidos, o ciclo de eventos e o adapter que rejeita qualquer registro sem executor. Esta camada testa somente o target interno autorizado; os payloads específicos de cada categoria serão refinados sobre fixtures vulneráveis do laboratório sem permitir saída da rede Docker.

## Execução fechada no Docker

O runner de produção deverá executar somente em uma rede Docker `internal`, com o alvo e o runner como serviços separados, sem portas publicadas, sem Docker socket e sem rota de saída. O stress adversarial será aplicado apenas ao alvo local, com concorrência, timeout, orçamento de requisições e condição de parada declarados por teste. Evidências de secrets usam canários sintéticos e aparecem mascaradas. A configuração de referência está em `docker/compose/docker-compose.yml` e o modelo completo em `docs/SECURITY_MODEL.md`.

O comportamento esperado do futuro runner é de um **atacante determinístico**: Recon → Attack → Exploit → Chain → Validate → Prove → Report → Continue. Encontrar uma vulnerabilidade não encerra a campanha. O motor valida, tenta medir impacto e encadear falhas, enquanto o guard de autorização limita exclusivamente o escopo de atuação. A especificação está em `docs/ADVERSARIAL_ENGINE.md`.

A aplicação não possui conta, backend, banco de dados ou histórico obrigatório. Nenhuma credencial é enviada ou incluída no relatório.

## Como ajudar a evoluir

O repositório é público e foi organizado para receber contribuições incrementais. Novos detectores devem ser independentes, possuir um ID estável, declarar categoria e severidade, produzir evidência redigida e nunca executar ações ativas sem autorização explícita. Melhorias de interface, documentação, acessibilidade e compatibilidade também são bem-vindas.

Fluxo recomendado:

1. Abra uma Issue descrevendo o problema ou teste desejado.
2. Crie uma branch pequena a partir de `main`.
3. Implemente a mudança sem incluir segredos, dados reais ou credenciais.
4. Rode `pnpm check` e `npx expo export --platform web`.
5. Envie um Pull Request com contexto, evidências e limitações conhecidas.

Consulte `CONTRIBUTING.md` para o padrão de testes e revisão.

## Executar localmente

```bash
pnpm install
pnpm dev
```

Para abrir no Android com Expo Go, execute `pnpm android` em um computador com o ambiente Expo configurado.

## Gerar APK

A geração de um APK instalável requer um ambiente de build Android/EAS. Depois de configurar as credenciais de build, use:

```bash
npx eas build --platform android --profile preview
```

O arquivo de configuração do app está em `app.config.ts`, com pacote Android `com.app.securitytestlab`.

## Estrutura principal

- `app/(tabs)/index.tsx`: interface e fluxo do MVP.
- `app/(tabs)/_layout.tsx`: navegação.
- `app.config.ts`: identidade e configuração Android.
- `assets/images/`: ícones e splash gerados pelo scaffold.

## Segurança

Use somente contra projetos próprios ou alvos para os quais exista autorização explícita. Testes ativos, carga, autenticação e exploração devem ser adicionados posteriormente com limites, timeout, isolamento e evidências redigidas.

## Licença

MIT. Consulte `LICENSE`.
