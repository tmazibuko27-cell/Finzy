import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

const root = process.cwd();
const outputDir = path.join(root, 'data', 'cfa.local');
const outputFile = path.join(outputDir, 'question-bank.json');
const books = fs.readdirSync(root).filter((file) => file.toLowerCase().endsWith('.epub')).sort();

if (books.length === 0) {
  console.error('No EPUB files found in the project root.');
  process.exit(1);
}

function archiveEntries(book) {
  return execFileSync('unzip', ['-Z1', book], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
}

function readEntry(book, entry) {
  return execFileSync('unzip', ['-p', book, entry], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}

function clean(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function answerLetter(text) {
  const match = text.match(/(?:^|\s)([ABC])\s+is\s+correct\b|(?:correct answer|answer is|correct option)\s*(?:is|:)?\s*([ABC])/i);
  return (match?.[1] ?? match?.[2])?.toUpperCase() ?? null;
}

function parsePracticeFile(book, entry, answerEntry) {
  const questionHtml = readEntry(book, entry);
  const answerHtml = answerEntry ? readEntry(book, answerEntry) : '';
  const questionDoc = load(questionHtml);
  const answerDoc = load(answerHtml);
  const title = clean(questionDoc('title').first().text() || path.basename(entry, '.xhtml'));
  const answerItems = answerDoc('ol.order > li').toArray();
  const records = [];

  questionDoc('ol.order > li').each((index, element) => {
    const item = questionDoc(element);
    const prompt = clean(item.children('p').first().text());
    const options = item.children('ol').first().children('li').toArray().map((option, optionIndex) => ({
      id: String.fromCharCode(65 + optionIndex),
      label: clean(questionDoc(option).text()),
    })).filter((option) => option.label);

    if (!prompt || options.length < 2) return;
    const answerText = answerItems[index] ? clean(answerDoc(answerItems[index]).text()) : '';
    const correctOptionId = answerLetter(answerText);
    records.push({
      id: `${path.basename(book, path.extname(book))}:${entry}:${index + 1}`,
      sourceBook: book,
      sourceEntry: entry,
      sourceTitle: title,
      prompt,
      options,
      correctOptionId,
      explanation: answerText || null,
      status: correctOptionId ? 'needs-review' : 'needs-answer-key',
    });
  });

  return records;
}

const records = [];
for (const book of books) {
  const entries = archiveEntries(book);
  const questionEntries = entries.filter((entry) => /-eorq-q\.xhtml$/i.test(entry));
  for (const entry of questionEntries) {
    const answerEntry = entry.replace(/-eorq-q\.xhtml$/i, '-eorq-a.xhtml');
    records.push(...parsePracticeFile(book, entry, entries.includes(answerEntry) ? answerEntry : null));
  }
}

const unique = [...new Map(records.map((record) => [`${record.prompt}|${record.options.map((option) => option.label).join('|')}`, record])).values()];
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), books, records: unique }, null, 2)}\n`);

const answerable = unique.filter((record) => record.correctOptionId).length;
console.log(`Imported ${unique.length} unique practice questions from ${books.length} EPUBs.`);
console.log(`${answerable} include a detected answer marker; ${unique.length - answerable} need answer-key review.`);
console.log(`Private output: ${path.relative(root, outputFile)}`);