# Modelo de segurança de execução

## Princípio

O Security Test Lab deve pensar como um atacante e tentar quebrar de verdade o alvo autorizado, mas executar apenas contra um ambiente controlado. A contenção define onde o atacante pode agir; não deve tornar o motor conservador dentro do escopo. O alvo é iniciado como um serviço Docker local e o runner conversa somente com o hostname interno `target`. Consulte `docs/ADVERSARIAL_ENGINE.md` para o contrato completo.

## Ciclo adversarial

O fluxo de campanha é `Recon → Attack → Exploit → Chain → Validate → Prove → Report → Continue`. Um finding não encerra a campanha: ele é validado, medido, usado como possível pré-condição de encadeamento e registrado antes de o engine continuar com as hipóteses restantes.

O guard de escopo/autorização fica separado do cérebro adversarial. Ele impõe rede, serviços, caminhos, duração, concorrência, orçamento de requisições e dados permitidos. O engine pode ser agressivo dentro desses limites.

## Rede fechada

A rede `securitytestlab-isolated` usa `internal: true`, não possui rota de saída e não deve receber portas publicadas no host. O compose não usa `network_mode: host`, não monta o Docker socket e não fornece credenciais do host ao alvo.

Qualquer dependência necessária aos testes deve ser empacotada na imagem do runner ou disponibilizada como fixture local. O modo padrão é `STL_EXTERNAL_NETWORK=false`.

## Stress adversarial

O runner pode usar concorrência e volume suficientes para pressionar rate limits, timeouts, filas, autenticação e recuperação, porém apenas contra o serviço `target` local. Todo teste precisa declarar timeout, limite de concorrência, orçamento de requisições e condição de parada. O objetivo é observar e validar a defesa dentro do ambiente fechado, não manter indisponibilidade fora dele.

## Dados sensíveis

O ambiente de teste deve usar fixtures sintéticas. Para validar detecção de vazamento, use canários como `STL_CANARY_ENV_001=canary-demo-7f3a` e nunca segredos reais. Se um padrão sensível aparecer em evidência, o relatório deve preservar apenas um trecho mascarado, por exemplo `env: serrd***********kfdd`, além de hash ou identificador da fixture quando necessário.

## Limpeza

Containers, redes, volumes e imagens recebem as labels `com.securitytestlab=true` e `securitytestlab.owner=SecurityTestLab`. A limpeza deve filtrar por essas labels e nunca executar limpeza global do Docker.

## Limites do Android

O app Android coordena a preparação e o relatório. A execução Docker fechada pertence ao runner desktop/multiplataforma, onde o Docker Engine está disponível. O app não deve fingir que executou testes ativos se o runner isolado não foi iniciado.
