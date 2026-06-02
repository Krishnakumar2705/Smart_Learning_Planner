const fs = require('fs');
const path = require('path');

const dirs = ['src/pages', 'src/components'];

const replacements = [
  { target: /text-white/g, replacement: 'text-slate-900 dark:text-white', cleanup: /text-slate-900 dark:text-slate-900 dark:text-white/g, cleanTo: 'text-slate-900 dark:text-white' },
  { target: /text-gray-400/g, replacement: 'text-slate-500 dark:text-gray-400', cleanup: /text-slate-500 dark:text-slate-500 dark:text-gray-400/g, cleanTo: 'text-slate-500 dark:text-gray-400' },
  { target: /text-gray-300/g, replacement: 'text-slate-600 dark:text-gray-300', cleanup: /text-slate-600 dark:text-slate-600 dark:text-gray-300/g, cleanTo: 'text-slate-600 dark:text-gray-300' },
  { target: /text-gray-500/g, replacement: 'text-slate-400 dark:text-gray-500', cleanup: /text-slate-400 dark:text-slate-400 dark:text-gray-500/g, cleanTo: 'text-slate-400 dark:text-gray-500' },
  { target: /bg-black\/40/g, replacement: 'bg-slate-100 dark:bg-black/40', cleanup: /bg-slate-100 dark:bg-slate-100 dark:bg-black\/40/g, cleanTo: 'bg-slate-100 dark:bg-black/40' },
  { target: /bg-\[#05060b\]/g, replacement: 'bg-slate-50 dark:bg-[#05060b]', cleanup: /bg-slate-50 dark:bg-slate-50 dark:bg-\[#05060b\]/g, cleanTo: 'bg-slate-50 dark:bg-[#05060b]' },
  { target: /border-white\/10/g, replacement: 'border-slate-200 dark:border-white/10', cleanup: /border-slate-200 dark:border-slate-200 dark:border-white\/10/g, cleanTo: 'border-slate-200 dark:border-white/10' },
  { target: /bg-white\/5/g, replacement: 'bg-slate-200 dark:bg-white/5', cleanup: /bg-slate-200 dark:bg-slate-200 dark:bg-white\/5/g, cleanTo: 'bg-slate-200 dark:bg-white/5' },
  { target: /bg-white\/10/g, replacement: 'bg-slate-300 dark:bg-white/10', cleanup: /bg-slate-300 dark:bg-slate-300 dark:bg-white\/10/g, cleanTo: 'bg-slate-300 dark:bg-white/10' },
  { target: /bg-indigo-500\/10/g, replacement: 'bg-indigo-100 dark:bg-indigo-500/10', cleanup: /bg-indigo-100 dark:bg-indigo-100 dark:bg-indigo-500\/10/g, cleanTo: 'bg-indigo-100 dark:bg-indigo-500/10' },
  { target: /border-indigo-500\/20/g, replacement: 'border-indigo-200 dark:border-indigo-500/20', cleanup: /border-indigo-200 dark:border-indigo-200 dark:border-indigo-500\/20/g, cleanTo: 'border-indigo-200 dark:border-indigo-500/20' },
  { target: /bg-cyan-500\/10/g, replacement: 'bg-cyan-100 dark:bg-cyan-500/10', cleanup: /bg-cyan-100 dark:bg-cyan-100 dark:bg-cyan-500\/10/g, cleanTo: 'bg-cyan-100 dark:bg-cyan-500/10' },
  { target: /border-cyan-500\/20/g, replacement: 'border-cyan-200 dark:border-cyan-500/20', cleanup: /border-cyan-200 dark:border-cyan-200 dark:border-cyan-500\/20/g, cleanTo: 'border-cyan-200 dark:border-cyan-500/20' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      replacements.forEach(r => {
        content = content.replace(r.target, r.replacement);
        content = content.replace(r.cleanup, r.cleanTo);
      });
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Processed', fullPath);
      }
    }
  }
}

dirs.forEach(d => processDir(path.join(__dirname, d)));
