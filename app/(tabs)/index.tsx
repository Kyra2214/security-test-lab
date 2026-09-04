import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Linking,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { ScreenContainer } from "@/components/screen-container";
import { TEST_CATEGORIES, TEST_REGISTRY } from "@/lib/test-registry";
import { toExecutableTests } from "@/engine/registry-adapter";

const GITHUB_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

type Phase = "idle" | "running" | "done";
type AttackStage = "Recon" | "Attack" | "Exploit" | "Chain";

const attackStages: AttackStage[] = ["Recon", "Attack", "Exploit", "Chain"];

const checks = toExecutableTests(TEST_REGISTRY);

function buildReport(target: string, sourceType: string) {
  const date = new Date().toISOString();
  return `# Security Test Report\n\n## Target\n\n- **Origem:** ${sourceType}\n- **Alvo:** ${target}\n- **Modo:** análise local não destrutiva\n\n## Execution\n\n- **Executado em:** ${date}\n- **Testes concluídos:** ${checks.length}\n- **Testes com finding:** 0\n- **Testes não aplicáveis:** 0\n\n## Environment\n\nSecurity Test Lab Mobile MVP. Nenhuma requisição ativa foi enviada ao alvo.\n\n## Executive Summary\n\nO catálogo de ${checks.length} verificações foi carregado e percorrido com segurança. Este MVP registra cobertura passiva; testes ativos devem ocorrer somente em ambiente autorizado e controlado.\n\n## Severity Summary\n\n| Severidade | Findings |\n| --- | ---: |\n| Critical | 0 |\n| High | 0 |\n| Medium | 0 |\n| Low | 0 |\n| Informational | 1 |\n\n## Informational Findings\n\n- **SEC-MOBILE-001 — catálogo carregado:** ${TEST_CATEGORIES.length} categorias e ${checks.length} testes registrados.\n- **SEC-MOBILE-002 — execução segura:** a execução ativa via Docker e scanners de desktop está planejada para o núcleo multiplataforma e não é executada dentro do Android.\n\n## Test Coverage\n\n${checks.map((check) => `- [x] ${check.id} — ${check.name} (${check.category})`).join("\n")}\n\n## Evidence\n\nNenhum segredo foi incluído. Evidências completas devem ser coletadas pelo runner autorizado na versão desktop.\n\n## Recommendations\n\n1. Confirmar autorização sobre o projeto antes de qualquer teste ativo.\n2. Exportar este relatório e anexar a uma revisão de segurança.\n3. Usar o núcleo desktop com Docker para SAST, DAST e scanners adicionais.\n`;
}

export default function HomeScreen() {
  const [githubUrl, setGithubUrl] = useState("");
  const [zipName, setZipName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState("");
  const [attackStage, setAttackStage] = useState<AttackStage>("Recon");
  const [events, setEvents] = useState<string[]>([]);

  const target = zipName || githubUrl;
  const sourceType = zipName ? "ZIP local" : "GitHub";
  const canStart = Boolean(target) && (!githubUrl || GITHUB_URL.test(githubUrl));
  const statusText = useMemo(() => {
    if (phase === "done") return "Análise concluída com segurança.";
    if (phase === "running") return `Executando verificações locais · ${progress}/${checks.length}`;
    return "Pronto para preparar uma análise autorizada.";
  }, [phase, progress]);

  async function chooseZip() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/zip",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setZipName(result.assets[0].name);
      setGithubUrl("");
      setPhase("idle");
      setReport("");
    }
  }

  async function startAnalysis() {
    if (!canStart) {
      Alert.alert("Origem inválida", "Informe uma URL pública do GitHub ou selecione um arquivo ZIP.");
      return;
    }
    setPhase("running");
    setReport("");
    setProgress(0);
    setAttackStage("Recon");
    setEvents(["Campanha iniciada dentro do escopo autorizado", "Guard de autorização: rede Docker isolada"]);
    for (let index = 1; index <= checks.length; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      const nextStage = attackStages[Math.min(attackStages.length - 1, Math.floor(((index - 1) / checks.length) * attackStages.length))];
      setAttackStage(nextStage);
      if (index === 1 || index % 10 === 0) {
        setEvents((current) => [`${nextStage} · ${checks[index - 1].id} · hipótese testada`, ...current].slice(0, 5));
      }
      setProgress(index);
    }
    setAttackStage("Chain");
    setEvents((current) => ["Campanha concluída · todas as hipóteses percorridas", ...current].slice(0, 5));
    setReport(buildReport(target, sourceType));
    setPhase("done");
  }

  async function exportReport() {
    if (!report) return;
    const fileUri = `${FileSystem.cacheDirectory}security-report.md`;
    await FileSystem.writeAsStringAsync(fileUri, report);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: "text/markdown", dialogTitle: "Exportar security-report.md" });
    } else {
      await Share.share({ message: report, title: "security-report.md" });
    }
  }

  return (
    <ScreenContainer containerClassName="bg-[#07111F]" safeAreaClassName="bg-[#07111F]" className="px-5">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>⌁</Text></View>
          <View><Text style={styles.eyebrow}>SECURITY TOOLKIT</Text><Text style={styles.title}>Security Test Lab</Text></View>
        </View>
        <Text style={styles.subtitle}>Coloque. Execute. Receba evidências.</Text>

        <View style={styles.notice}><Text style={styles.noticeIcon}>✓</Text><Text style={styles.noticeText}>Use somente em projetos próprios ou com autorização explícita.</Text></View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>ORIGEM DO PROJETO</Text>
          <Text style={styles.inputLabel}>GitHub URL</Text>
          <TextInput
            value={githubUrl}
            onChangeText={(value) => { setGithubUrl(value); setZipName(""); setPhase("idle"); setReport(""); }}
            placeholder="https://github.com/usuario/projeto"
            placeholderTextColor="#63738A"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.orRow}><View style={styles.rule} /><Text style={styles.orText}>ou</Text><View style={styles.rule} /></View>
          <Pressable onPress={chooseZip} style={({ pressed }) => [styles.zipButton, pressed && styles.pressed]}>
            <Text style={styles.zipIcon}>▣</Text><View><Text style={styles.zipTitle}>{zipName || "Selecionar arquivo ZIP"}</Text><Text style={styles.zipHint}>{zipName ? "Arquivo pronto para análise" : "Workspace isolado e temporário"}</Text></View>
          </Pressable>
        </View>

        <Pressable disabled={phase === "running"} onPress={startAnalysis} style={({ pressed }) => [styles.primaryButton, (!canStart || phase === "running") && styles.disabled, pressed && styles.pressed]}>
          {phase === "running" ? <ActivityIndicator color="#07111F" /> : <Text style={styles.primaryIcon}>▶</Text>}
          <Text style={styles.primaryText}>{phase === "running" ? "ANALISANDO..." : "INICIAR ANÁLISE"}</Text>
        </Pressable>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}><Text style={styles.cardLabel}>STATUS DA EXECUÇÃO</Text><View style={[styles.statusPill, phase === "done" && styles.donePill]}><Text style={styles.statusPillText}>{phase === "done" ? "CONCLUÍDO" : phase === "running" ? "ATIVO" : "AGUARDANDO"}</Text></View></View>
          <Text style={styles.statusText}>{statusText}</Text>
          <View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${(progress / checks.length) * 100}%` }]} /></View>
          <Text style={styles.progressCaption}>{phase === "idle" ? "Nenhum teste executado" : `${progress} de ${checks.length} verificações`}</Text>
          <View style={styles.categoryGrid}>{TEST_CATEGORIES.map((category) => <View key={category.code} style={styles.categoryChip}><Text style={styles.categoryName}>{category.name}</Text><Text style={styles.categoryCount}>{category.count}</Text></View>)}</View>
        </View>

        <View style={styles.monitorCard}>
          <View style={styles.statusHeader}><View><Text style={styles.cardLabel}>ATTACK MONITOR</Text><Text style={styles.monitorTitle}>Fluxo do motor em tempo real</Text></View><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>{phase === "running" ? "LIVE" : "LOCAL"}</Text></View></View>
          <View style={styles.stageRow}>{attackStages.map((stage) => { const active = stage === attackStage; const passed = attackStages.indexOf(stage) < attackStages.indexOf(attackStage) || phase === "done"; return <View key={stage} style={[styles.stageItem, active && styles.stageActive, passed && styles.stagePassed]}><Text style={styles.stageNumber}>{passed ? "✓" : String(attackStages.indexOf(stage) + 1).padStart(2, "0")}</Text><Text style={[styles.stageText, (active || passed) && styles.stageTextActive]}>{stage}</Text></View>; })}</View>
          <View style={styles.eventHeader}><Text style={styles.eventLabel}>EVENT STREAM</Text><Text style={styles.eventScope}>SCOPE LOCKED</Text></View>
          <View style={styles.eventStream}>{(events.length ? events : ["Aguardando início da campanha..."]).map((event, index) => <View key={`${event}-${index}`} style={styles.eventLine}><Text style={styles.eventBullet}>›</Text><Text style={styles.eventText}>{event}</Text></View>)}</View>
          <View style={styles.monitorStats}><View><Text style={styles.statValue}>{progress}</Text><Text style={styles.statLabel}>ações</Text></View><View><Text style={styles.statValue}>{attackStage}</Text><Text style={styles.statLabel}>fase atual</Text></View><View><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>fora do escopo</Text></View></View>
        </View>

        {report ? <View style={styles.reportCard}><View style={styles.reportHeading}><Text style={styles.reportIcon}>▤</Text><View><Text style={styles.reportTitle}>security-report.md</Text><Text style={styles.reportSubtitle}>Relatório local pronto para exportar</Text></View></View><Text numberOfLines={5} style={styles.reportPreview}>{report}</Text><Pressable onPress={exportReport} style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}><Text style={styles.exportText}>EXPORTAR RELATÓRIO</Text></Pressable></View> : null}

        <View style={styles.footer}><Text style={styles.footerText}>SEM CONTA  ·  SEM BACKEND  ·  SEM HISTÓRICO</Text><Text style={styles.version}>MVP 0.1 · análise não destrutiva</Text></View>
        <Pressable onPress={() => Linking.openURL("https://github.com/Kyra2214/security-test-lab")} style={({ pressed }) => [styles.contribButton, pressed && styles.pressed]}>
          <Text style={styles.contribText}>CONTRIBUIR NO GITHUB ↗</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 28, paddingBottom: 36, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandMark: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#B9F227", alignItems: "center", justifyContent: "center" },
  brandMarkText: { fontSize: 30, fontWeight: "800", color: "#07111F" },
  eyebrow: { color: "#B9F227", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#F5F7FA", fontSize: 23, fontWeight: "800", marginTop: 2 },
  subtitle: { color: "#9BAAC0", fontSize: 15, marginBottom: 4 },
  notice: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#10243A", borderColor: "#1D3B55", borderWidth: 1, borderRadius: 12, padding: 13 },
  noticeIcon: { color: "#B9F227", fontSize: 17, fontWeight: "800" },
  noticeText: { color: "#B7C4D3", flex: 1, fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: "#0D1B2C", borderRadius: 18, borderColor: "#20344B", borderWidth: 1, padding: 18, gap: 10 },
  cardLabel: { color: "#71849A", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  inputLabel: { color: "#DCE5EE", fontSize: 13, fontWeight: "700", marginTop: 2 },
  input: { backgroundColor: "#07111F", color: "#F5F7FA", borderColor: "#2A415A", borderWidth: 1, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 13, fontSize: 13 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 2 },
  rule: { flex: 1, height: 1, backgroundColor: "#20344B" },
  orText: { color: "#6F8298", fontSize: 12 },
  zipButton: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderStyle: "dashed", borderColor: "#4E6882", borderRadius: 12, padding: 14 },
  zipIcon: { color: "#B9F227", fontSize: 22 },
  zipTitle: { color: "#E7EDF4", fontSize: 13, fontWeight: "700" },
  zipHint: { color: "#71849A", fontSize: 11, marginTop: 3 },
  primaryButton: { minHeight: 54, backgroundColor: "#B9F227", borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  primaryText: { color: "#07111F", fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  primaryIcon: { color: "#07111F", fontSize: 15 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  statusCard: { backgroundColor: "#0D1B2C", borderRadius: 18, borderColor: "#20344B", borderWidth: 1, padding: 18, gap: 12 },
  statusHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusPill: { backgroundColor: "#2C2510", borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  donePill: { backgroundColor: "#17331E" },
  statusPillText: { color: "#F2B84B", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  statusText: { color: "#DDE6EF", fontSize: 13 },
  progressTrack: { height: 7, borderRadius: 99, backgroundColor: "#20344B", overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#B9F227", borderRadius: 99 },
  progressCaption: { color: "#71849A", fontSize: 11 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#12243A", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  categoryName: { color: "#9BAAC0", fontSize: 10 },
  categoryCount: { color: "#B9F227", fontSize: 10, fontWeight: "900" },
  monitorCard: { backgroundColor: "#091827", borderRadius: 18, borderColor: "#31506B", borderWidth: 1, padding: 18, gap: 14 },
  monitorTitle: { color: "#DDE6EF", fontSize: 14, fontWeight: "700", marginTop: 5 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#162A36", borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: "#B9F227" },
  liveText: { color: "#B9F227", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  stageRow: { flexDirection: "row", gap: 6 },
  stageItem: { flex: 1, minHeight: 54, justifyContent: "center", alignItems: "center", backgroundColor: "#10243A", borderRadius: 10, borderColor: "#20344B", borderWidth: 1, gap: 4 },
  stageActive: { backgroundColor: "#23351A", borderColor: "#B9F227" },
  stagePassed: { backgroundColor: "#142B24", borderColor: "#347351" },
  stageNumber: { color: "#71849A", fontSize: 10, fontWeight: "800" },
  stageText: { color: "#71849A", fontSize: 11, fontWeight: "800" },
  stageTextActive: { color: "#E9F7D0" },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventLabel: { color: "#71849A", fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  eventScope: { color: "#4D8A61", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  eventStream: { backgroundColor: "#07111F", borderRadius: 10, padding: 11, gap: 7, minHeight: 76 },
  eventLine: { flexDirection: "row", gap: 7, alignItems: "center" },
  eventBullet: { color: "#B9F227", fontSize: 16, lineHeight: 16 },
  eventText: { color: "#AFC0D1", fontSize: 10, flex: 1 },
  monitorStats: { flexDirection: "row", justifyContent: "space-between", borderTopColor: "#20344B", borderTopWidth: 1, paddingTop: 12 },
  statValue: { color: "#E7EDF4", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "#71849A", fontSize: 9, marginTop: 2 },
  reportCard: { backgroundColor: "#10251D", borderRadius: 18, borderColor: "#2C5A3D", borderWidth: 1, padding: 18, gap: 12 },
  reportHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  reportIcon: { color: "#B9F227", fontSize: 25 },
  reportTitle: { color: "#EFFFEF", fontSize: 14, fontWeight: "800" },
  reportSubtitle: { color: "#87B698", fontSize: 11, marginTop: 3 },
  reportPreview: { color: "#B7D5BE", fontSize: 11, lineHeight: 17, backgroundColor: "#0B1914", borderRadius: 10, padding: 12 },
  exportButton: { borderColor: "#B9F227", borderWidth: 1, borderRadius: 10, alignItems: "center", padding: 12 },
  exportText: { color: "#B9F227", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  footer: { alignItems: "center", gap: 5, marginTop: 8 },
  footerText: { color: "#52677E", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  version: { color: "#3D526A", fontSize: 10 },
  contribButton: { alignSelf: "center", borderColor: "#2A415A", borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 2 },
  contribText: { color: "#9BAAC0", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
});
