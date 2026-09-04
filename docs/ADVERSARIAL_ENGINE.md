# Adversarial Engine

## Decisão de arquitetura

O Security Test Lab não é um detector passivo que apenas aponta padrões. Quando existe autorização válida, o motor deve tentar quebrar o alvo de forma determinística, reproduzível e mensurável. A contenção define **onde** o atacante pode agir; ela não reduz a profundidade do raciocínio adversarial dentro do escopo.

> Escopo conservador. Comportamento agressivo dentro do escopo.

## Separação de responsabilidades

### Scope / Authorization Guard

O guard recebe o manifesto da execução, verifica o alvo autorizado e aplica limites imutáveis: rede permitida, serviços permitidos, caminhos, métodos, duração, concorrência, orçamento de requisições e tipos de dados que podem ser lidos. O guard fica fora do cérebro do atacante. Ele pode bloquear uma ação fora do escopo, mas não pode encerrar uma investigação válida apenas porque um finding foi encontrado.

### Adversarial Engine

O engine recebe somente o escopo permitido e trabalha com uma fila de hipóteses. Ele pode descobrir endpoints, manipular parâmetros, testar autenticação e autorização, fuzzar entradas, testar injeções, traversal, uploads, sessões/JWT, rate limiting e cargas controladas. Quando uma hipótese funciona, o engine valida a exploração, mede o impacto permitido, tenta combinações com outras falhas e continua com as hipóteses restantes.

O comportamento deve ser:

```text
Recon → Attack → Exploit → Chain → Validate → Prove → Report → Continue
```

Uma vulnerabilidade encontrada é um evento de evidência, não uma condição de parada.

## Validação e encadeamento

Cada finding passa por estados explícitos: `suspected`, `validated`, `impact-measured`, `chained` ou `unconfirmed`. A validação deve usar a menor prova suficiente, com fixtures e canários sintéticos quando houver dados sensíveis. O engine não deve exfiltrar dados reais; deve provar acesso com identificadores, hashes, metadados ou canários redigidos.

O encadeamento usa um grafo de pré-condições e efeitos. Exemplos de alto nível incluem: descoberta de rota + falha de autorização; sessão fraca + troca de identidade; upload inseguro + leitura de arquivo canário; injeção validada + acesso a fixture de teste. Cada cadeia tem limite de profundidade, timeout e critério de abortar definido pelo guard.

## Escopo de ações

Permitido dentro do ambiente autorizado e isolado:

- Enumerar e explorar endpoints do target local.
- Tentar bypasses e escalada de privilégios com identidades sintéticas.
- Enviar entradas adversariais e fuzzing com corpus controlado.
- Medir rate limiting, concorrência, filas e recuperação.
- Validar impacto usando dados de teste e canários.
- Continuar a campanha após um finding.

Nunca permitido:

- Sair da rede Docker `internal`.
- Alcançar hosts, serviços ou IPs fora do manifesto.
- Usar credenciais do host ou montar o Docker socket.
- Exfiltrar segredos reais, PII ou dados de terceiros.
- Persistir acesso fora do workspace temporário.
- Remover recursos Docker que não tenham labels do Security Test Lab.

## Contrato de um teste

Todo teste precisa declarar `id`, `category`, `hypothesis`, `preconditions`, `attack_steps`, `validation`, `impact_measurement`, `chain_candidates`, `timeout`, `request_budget`, `concurrency` e `evidence_redaction`. O resultado deve diferenciar vulnerabilidade validada, hipótese não confirmada, teste bloqueado pelo escopo, falha de infraestrutura e teste não aplicável.

## Relatório

O relatório deve registrar a campanha completa: hipóteses tentadas, caminhos explorados, findings validados, cadeias testadas, tentativas bloqueadas pelo escopo, evidências mascaradas, cobertura e recomendações. Encontrar uma vulnerabilidade nunca deve ocultar as tentativas subsequentes.
