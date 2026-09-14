import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';
import type { Lab } from '@/features/labs/catalog';
import { ModelChart } from './ModelChart';

type Phase = 'predict' | 'explore' | 'check' | 'done';
const PHASES: Phase[] = ['predict', 'explore', 'check', 'done'];

export function LabExperience({ lab, onExit }: { lab: Lab; onExit: () => void }) {
  const theme = useTheme();
  const scroll = useRef<ScrollView>(null);
  const [phase, setPhase] = useState<Phase>('predict');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [value, setValue] = useState(lab.scenario);
  const [explored, setExplored] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const changePhase = (next: Phase) => {
    setPhase(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const result = lab.calculate(value);
  const baseline = lab.calculate(lab.initial);
  const delta = (result / baseline - 1) * 100;
  const advance = () => {
    if (phase === 'predict' && prediction !== null) changePhase('explore');
    else if (phase === 'explore' && explored) changePhase('check');
    else if (phase === 'check' && answer !== null) changePhase('done');
  };
  const disabled = phase === 'predict' ? prediction === null : phase === 'explore' ? !explored : answer === null;
  const buttonLabel = phase === 'predict' ? 'Reveal the model' : phase === 'explore' ? 'Test your understanding' : 'See your takeaway';

  return (
    <ScrollView ref={scroll} style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.page}>
      <View style={styles.steps} accessibilityLabel={`Step ${PHASES.indexOf(phase) + 1} of 4`}>
        {['Predict', 'Explore', 'Apply', 'Takeaway'].map((label, index) => (
          <View key={label} style={styles.step}>
            <View style={[styles.stepLine, { backgroundColor: index <= PHASES.indexOf(phase) ? theme.colors.action : theme.colors.border }]} />
            <Text style={[styles.small, { color: theme.colors.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.eyebrow, { color: theme.colors.action }]}>FINZY LAB / {lab.category}</Text>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.textPrimary }]}>{lab.title}</Text>

      {phase === 'predict' ? (
        <>
          <View style={[styles.brief, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.eyebrow, { color: theme.colors.textSecondary }]}>THE SETUP · HYPOTHETICAL</Text>
            <Text style={[styles.body, { color: theme.colors.textPrimary }]}>{lab.brief}</Text>
          </View>
          <Text style={[styles.question, { color: theme.colors.textPrimary }]}>{lab.prediction}</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>Make a prediction. Then see the mechanics.</Text>
          <Choices options={lab.choices} selected={prediction} onSelect={setPrediction} />
        </>
      ) : null}

      {phase === 'explore' ? (
        <>
          <View style={[styles.brief, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} accessibilityLiveRegion="polite">
            <Text style={[styles.question, { color: theme.colors.textPrimary }]}>{prediction === lab.correct ? 'You called it.' : 'Here’s the surprising part.'}</Text>
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{lab.explanation}</Text>
          </View>
          <View style={styles.model}>
            <View style={styles.modelTop}>
              <Text style={styles.modelLabel}>{lab.output.toUpperCase()}</Text>
              <View style={styles.modelBadge}><Text style={[styles.small, { color: lab.accent }]}>INTERACTIVE MODEL</Text></View>
            </View>
            <Text style={[styles.value, { color: lab.accent }]}>{lab.slug === 'the-equity-bridge' ? '' : '$'}{result.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</Text>
            <Text style={styles.modelLabel}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs. {lab.initial}{lab.unit} baseline</Text>
            <ModelChart lab={lab} value={value} />
            <View style={styles.control}>
              <Control label={`Decrease ${lab.control}`} disabled={value <= lab.min} onPress={() => { setValue(Math.max(lab.min, value - lab.step)); setExplored(true); }} icon="remove" />
              <View style={styles.controlValue} accessibilityLiveRegion="polite">
                <Text style={styles.controlNumber}>{value}{lab.unit}</Text>
                <Text style={styles.modelLabel}>{lab.control}</Text>
              </View>
              <Control label={`Increase ${lab.control}`} disabled={value >= lab.max} onPress={() => { setValue(Math.min(lab.max, value + lab.step)); setExplored(true); }} icon="add" />
            </View>
            <Text style={styles.modelHint}>{explored ? lab.insight : 'Tap − or + to change an assumption and watch the model respond.'}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showAssumptions }} onPress={() => setShowAssumptions(!showAssumptions)} style={styles.assumptionsButton}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>Model assumptions</Text>
            <Ionicons name={showAssumptions ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textSecondary} />
          </Pressable>
          {showAssumptions ? <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{lab.assumption}</Text> : null}
        </>
      ) : null}

      {phase === 'check' ? (
        <>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>A new situation. Same underlying idea.</Text>
          <Text style={[styles.question, { color: theme.colors.textPrimary }]}>{lab.check}</Text>
          <Choices options={lab.checkChoices} selected={answer} onSelect={setAnswer} />
        </>
      ) : null}

      {phase === 'done' ? (
        <>
          <View style={styles.model}>
            <Ionicons name={answer === lab.checkCorrect ? 'checkmark-circle-outline' : 'bulb-outline'} size={44} color={lab.accent} />
            <Text style={[styles.question, { color: '#FFF' }]}>{answer === lab.checkCorrect ? 'Concept connected.' : 'One idea to take with you.'}</Text>
            <Text style={styles.takeaway}>{lab.takeaway}</Text>
            <Text style={styles.modelLabel}>Application answer: {lab.checkChoices[lab.checkCorrect]}</Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>You made a prediction, explored the model and applied the idea. These are practice results for this session.</Text>
          <Pressable accessibilityRole="button" style={[styles.primary, { backgroundColor: theme.colors.action }]} onPress={onExit}>
            <Text style={styles.primaryText}>Explore more finance</Text><Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.assumptionsButton} onPress={() => {
            setPrediction(null); setAnswer(null); setValue(lab.scenario); setExplored(false); setShowAssumptions(false); changePhase('predict');
          }}><Text style={[styles.body, { color: theme.colors.action }]}>Run the lab again</Text></Pressable>
        </>
      ) : (
        <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={advance}
          style={[styles.primary, { backgroundColor: theme.colors.action, opacity: disabled ? 0.45 : 1 }]}>
          <Text style={styles.primaryText}>{buttonLabel}</Text><Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      )}
      <Pressable accessibilityRole="link" accessibilityLabel={`Read source: ${lab.source.title}`} style={styles.source} onPress={() => {
        Linking.openURL(lab.source.url).catch(() => Alert.alert('Source unavailable', 'Check your connection and try again.'));
      }}>
        <Ionicons name="book-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={[styles.small, { color: theme.colors.textSecondary, flex: 1 }]}>{lab.source.title}</Text>
        <Ionicons name="open-outline" size={14} color={theme.colors.textSecondary} />
      </Pressable>
    </ScrollView>
  );
}

function Choices({ options, selected, onSelect }: { options: string[]; selected: number | null; onSelect: (index: number) => void }) {
  const theme = useTheme();
  return <View style={{ gap: 10 }}>{options.map((option, i) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: selected === i }} onPress={() => onSelect(i)}
    style={[styles.choice, { backgroundColor: theme.colors.surface, borderColor: selected === i ? theme.colors.action : theme.colors.border }]}>
    <Text style={[styles.letter, { color: theme.colors.action }]}>{String.fromCharCode(65 + i)}</Text>
    <Text style={[styles.body, { color: theme.colors.textPrimary, flex: 1 }]}>{option}</Text>
    {selected === i ? <Ionicons name="checkmark-circle" size={20} color={theme.colors.action} /> : null}
  </Pressable>)}</View>;
}
function Control({ label, disabled, onPress, icon }: { label: string; disabled: boolean; onPress: () => void; icon: 'add' | 'remove' }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[styles.stepper, { opacity: disabled ? 0.3 : 1 }]}><Ionicons name={icon} size={24} color="#FFF" /></Pressable>;
}

const styles = StyleSheet.create({
  page: { padding: 22, paddingBottom: 48, gap: 18, width: '100%', maxWidth: 680, alignSelf: 'center' },
  steps: { flexDirection: 'row', gap: 8, marginBottom: 12 }, step: { flex: 1, gap: 8 }, stepLine: { height: 3, borderRadius: 2 },
  small: { fontSize: 11, lineHeight: 16 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -1, lineHeight: 40 }, body: { fontSize: 15, lineHeight: 23 },
  brief: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 }, question: { fontSize: 21, fontWeight: '700', lineHeight: 29 },
  choice: { borderWidth: 1.5, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  letter: { fontSize: 13, fontWeight: '800' }, primary: { borderRadius: 16, padding: 18, minHeight: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '700', flexShrink: 1 },
  model: { backgroundColor: '#101E2B', padding: 22, borderRadius: 24, gap: 16 }, modelTop: { gap: 8, alignItems: 'flex-start' },
  modelLabel: { color: '#A5B4C5', fontSize: 11, lineHeight: 17, letterSpacing: 0.3 }, modelBadge: { backgroundColor: '#203333', borderRadius: 6, padding: 5 },
  value: { fontSize: 42, fontWeight: '700', letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  control: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#293746', paddingTop: 16 },
  controlValue: { flex: 1, alignItems: 'center', gap: 4 }, controlNumber: { color: '#FFF', fontSize: 24, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stepper: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#283947', alignItems: 'center', justifyContent: 'center' },
  modelHint: { color: '#C8D6E4', fontSize: 13, lineHeight: 20 }, assumptionsButton: { flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 44 },
  takeaway: { color: '#E3EAF0', fontSize: 19, lineHeight: 29 }, source: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
});
