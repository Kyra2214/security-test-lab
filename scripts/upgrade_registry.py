from pathlib import Path
path = Path('/home/ubuntu/security-test-lab/scripts/generate_registry.py')
text = path.read_text()
text = text.replace('Cada entrada possui ID estável e é segura por padrão: análise passiva/local.', 'Cada entrada aponta para um executor adversarial dentro do target autorizado.')
text = text.replace('active: boolean };', 'active: true; approach: "adversarial"; executor: "scoped-probe"; guardrails: string[] };')
text = text.replace('active: false,', 'active: true,\n    approach: "adversarial",\n    executor: "scoped-probe",\n    guardrails: ["scope-guard", "timeout", "request-budget", "synthetic-only", "redacted-evidence"],')
path.write_text(text)
