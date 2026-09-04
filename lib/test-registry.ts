/** Registro determinístico de verificações do Security Test Lab.
 * Cada entrada aponta para um executor adversarial dentro do target autorizado.
 */
export type TestSeverity = "critical" | "high" | "medium" | "low" | "info";
export type SecurityTest = { id: string; name: string; category: string; severity: TestSeverity; description: string; active: true; approach: "adversarial"; executor: "scoped-probe"; guardrails: string[] };

const definitions = [
  { name: "API", code: "API", items: ['descoberta de endpoints', 'métodos HTTP', 'parâmetros', 'respostas', 'erros', 'documentação exposta', 'rotas administrativas', 'rotas de debug', 'versionamento', 'paginação', 'filtros', 'CORS da API', 'content negotiation', 'status codes', 'limites de tamanho', 'timeouts', 'redirecionamentos', 'cache da API', 'formatos de erro', 'telemetria'] },
  { name: "Authentication", code: "AUTH", items: ['login', 'política de senha', 'sessão', 'JWT', 'tokens', 'expiração', 'recuperação de senha', 'MFA', 'proteção contra brute force', 'rate limiting', 'logout', 'reautenticação', 'remember me', 'troca de senha', 'enumeração de usuários', 'credenciais padrão', 'cookies de autenticação', 'CSRF em autenticação', 'login social', 'bloqueio de conta'] },
  { name: "Authorization", code: "AUTHZ", items: ['IDOR', 'acesso horizontal', 'acesso vertical', 'recursos sem autorização', 'endpoints administrativos', 'elevação de privilégio', 'escopos', 'roles', 'permissões herdadas', 'objetos excluídos', 'multi-tenancy', 'mass assignment', 'funções internas', 'exportações', 'ações destrutivas', 'webhooks protegidos', 'jobs protegidos', 'arquivos privados', 'rotas internas', 'fallback de autorização'] },
  { name: "Secrets", code: "SECRET", items: ['API keys', 'tokens', 'passwords', 'chaves privadas', 'credenciais', 'arquivos .env', 'configurações', 'segredos em commits', 'segredos em logs', 'segredos em assets', 'cloud credentials', 'certificados', 'webhooks', 'DSNs', 'senhas de banco', 'chaves de sessão', 'segredos de CI', 'segredos em exemplos', 'entropia de tokens', 'redação de evidências'] },
  { name: "Headers", code: "HEADER", items: ['CSP', 'HSTS', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy', 'COOP', 'COEP', 'CORP', 'Cache-Control', 'headers de servidor', 'headers de debug', 'content type', 'content disposition', 'cookies Secure', 'cookies HttpOnly', 'SameSite', 'origem', 'política de embed', 'proteção de MIME'] },
  { name: "CORS", code: "CORS", items: ['origens permitidas', 'wildcard', 'credenciais', 'preflight', 'métodos', 'headers', 'origem nula', 'subdomínios', 'reflexão de origem', 'cache de preflight', 'exposição de headers', 'origens de desenvolvimento', 'origens internas', 'WebSocket origin', 'origens em erro', 'política por rota', 'regex de origem', 'protocolo inseguro', 'porta de origem', 'documentação CORS'] },
  { name: "Input", code: "INPUT", items: ['validação', 'sanitização', 'XSS', 'SQL injection', 'command injection', 'template injection', 'path traversal', 'LDAP injection', 'NoSQL injection', 'header injection', 'CRLF', 'open redirect', 'prototype pollution', 'deserialização', 'regex DoS', 'upload de arquivo', 'MIME spoofing', 'encoding', 'tamanho de entrada', 'caracteres de controle'] },
  { name: "Files", code: "FILE", items: ['uploads', 'extensões', 'MIME', 'path traversal', 'arquivos sensíveis', 'temporários', 'backups', 'listagem de diretórios', 'permissões', 'symlinks', 'nomes de arquivo', 'arquivos ocultos', 'source maps', 'logs', 'artefatos de build', 'downloads', 'preview de arquivos', 'cache local', 'arquivos públicos', 'isolamento de workspace'] },
  { name: "Dependencies", code: "DEP", items: ['dependências diretas', 'dependências transitivas', 'lockfiles', 'versões vulneráveis', 'pacotes abandonados', 'scripts de instalação', 'dependências de desenvolvimento', 'licenças', 'integridade', 'fontes de pacotes', 'pacotes privados', 'typosquatting', 'duplicidade', 'atualizações', 'runtime', 'SDKs', 'imagens base', 'plugins', 'bibliotecas nativas', 'reprodutibilidade'] },
  { name: "Configuration", code: "CONFIG", items: ['modo debug', 'stack traces', 'ambiente', 'credenciais', 'portas', 'serviços expostos', 'flags inseguras', 'defaults', 'logging', 'monitoramento', 'feature flags', 'configuração remota', 'segredos de deploy', 'TLS', 'proxy', 'timeouts', 'retry', 'limites', 'permissões', 'configuração de produção'] },
  { name: "Exposure", code: "EXPOSE", items: ['PII', 'tokens', 'dados internos', 'mensagens de erro', 'arquivos públicos', 'metadados', 'informações de versão', 'rotas de saúde', 'backups públicos', 'índices', 'logs públicos', 'relatórios', 'respostas verbose', 'identificadores', 'dados de debug', 'endereços internos', 'nomes de usuários', 'e-mails', 'telemetria', 'cache compartilhado'] },
  { name: "Resilience", code: "RES", items: ['timeout', 'retry', 'circuit breaker', 'falha de dependência', 'indisponibilidade', 'fallback', 'idempotência', 'concorrência', 'fila', 'dead letter', 'cancelamento', 'graceful shutdown', 'limite de memória', 'limite de CPU', 'backpressure', 'reconexão', 'transação', 'consistência', 'degradação', 'recuperação'] },
  { name: "Stress", code: "STRESS", items: ['carga controlada', 'concorrência', 'rate limit', 'estabilidade', 'tempo de resposta', 'recuperação após carga', 'burst', 'fila sob carga', 'limite por usuário', 'limite por IP', 'payload grande', 'conexões', 'workers', 'pool de banco', 'cache sob carga', 'latência', 'erro sob carga', 'shutdown sob carga', 'isolamento', 'limite global'] },
  { name: "Web", code: "WEB", items: ['cookies', 'sessões', 'CSRF', 'clickjacking', 'mixed content', 'TLS', 'redirecionamento', 'cache', 'service worker', 'manifest', 'storage', 'postMessage', 'origins', 'iframes', 'CSP de assets', 'integridade SRI', 'links externos', 'formulários', 'métodos inseguros', 'navegador legado'] },
  { name: "Supply Chain", code: "CHAIN", items: ['proveniência', 'SBOM', 'assinaturas', 'build reproduzível', 'CI', 'artefatos', 'release', 'dependabot', 'branch protection', 'segredos CI', 'permissões de workflow', 'actions de terceiros', 'runners', 'cache de CI', 'tags', 'releases', 'imagens', 'changelog', 'revisão de código', 'política de contribuição'] },
] as const;

export const TEST_REGISTRY: SecurityTest[] = definitions.flatMap((category) =>
  category.items.map((item, index) => ({
    id: `SEC-${category.code}-${String(index + 1).padStart(3, "0")}`,
    name: `Verificar ${item}`,
    category: category.name,
    severity: index < 2 ? "high" : index < 7 ? "medium" : "low",
    description: `Verificação determinística de ${item} no escopo autorizado.`,
    active: true,
    approach: "adversarial",
    executor: "scoped-probe",
    guardrails: ["scope-guard", "timeout", "request-budget", "synthetic-only", "redacted-evidence"],
  }))
);

export const TEST_CATEGORIES = definitions.map(({ name, code }) => ({
  name,
  code,
  count: TEST_REGISTRY.filter((test) => test.category === name).length,
}));

if (TEST_REGISTRY.length !== 300) {
  throw new Error(`Expected 300 security tests, got ${TEST_REGISTRY.length}`);
}
