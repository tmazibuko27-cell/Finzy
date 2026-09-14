import fs from 'node:fs';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

const root = process.cwd();
const source = fs.readdirSync(root).find((file) => file.toLowerCase().includes('sie exam') && file.toLowerCase().endsWith('.pdf'));
const outputDir = path.join(root, 'data', 'sie.local');
const outputFile = path.join(outputDir, 'question-bank.json');

if (!source) {
  console.error('No SIE Exam PDF found in the project root.');
  process.exit(1);
}

function clean(value) {
  return value.replace(/\s+/g, ' ').trim();
}

const parser = new PDFParse({ data: await readFile(path.join(root, source)) });
const text = (await parser.getText()).text;
await parser.destroy();

// The book labels answer explanations as “The right answer is (X).”. Keep the
// source wording and mark every extracted item for review before publishing.
const answerPattern = /The right answer is \(([A-D])\)\.([\s\S]*?)(?=The right answer is \([A-D]\)\.|$)/g;
const records = [];
let match;
let index = 0;

while ((match = answerPattern.exec(text))) {
  const answerStart = match.index;
  const before = text.slice(Math.max(0, answerStart - 2400), answerStart);
  const optionStart = before.lastIndexOf('(A)');
  if (optionStart < 0) continue;
  const block = before.slice(optionStart);
  const optionMatch = block.match(/^\(A\)\s*([\s\S]*?)\s+\(B\)\s*([\s\S]*?)\s+\(C\)\s*([\s\S]*?)\s+\(D\)\s*([\s\S]*)$/);
  if (!optionMatch) continue;

  const questionText = clean(before.slice(0, optionStart).split(/\n\s*\n/).pop() ?? '');
  const options = optionMatch.slice(1, 5).map((label, optionIndex) => ({
    id: String.fromCharCode(65 + optionIndex),
    label: clean(label),
  }));
  if (options.some((option) => option.label.length < 2)) continue;

  records.push({
    id: `sie:${index + 1}`,
    sourceBook: source,
    sourceTitle: 'SIE Exam 2025/2026 For Dummies',
    prompt: questionText,
    options,
    correctOptionId: match[1],
    explanation: clean(match[2]),
    status: 'needs-review',
  });
  index += 1;
}

const unique = [...new Map(records.map((record) => [record.prompt, record])).values()];
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), source, records: unique }, null, 2)}\n`);
console.log(`Extracted ${unique.length} SIE practice candidates from ${source}.`);
console.log(`Private output: ${path.relative(root, outputFile)}`);