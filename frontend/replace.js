const fs = require('fs');
const file = 'src/app/project/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['bg-[#09090b]', 'bg-bg-global'],
  ['bg-[#121212]', 'bg-bg-sidebar'],
  ['bg-[#191922]', 'bg-bg-editor'],
  ['bg-[#1A1A22]/95', 'bg-bg-chat'],
  ['bg-[#1A1A22]', 'bg-bg-header'],
  ['bg-[#282832]/95', 'bg-bg-element/95'],
  ['bg-[#282832]/80', 'bg-bg-element/80'],
  ['bg-[#282832]', 'bg-bg-element'],
  ['border-[#222]', 'border-border-layout'],
  ['border-[#2A2A35]', 'border-border-layout'],
  ['border-[#353542]', 'border-border-layout-strong'],
  ['bg-[#2A2A35]', 'bg-border-layout'],
  ['bg-[#353542]', 'bg-border-layout-strong']
];

for (const [from, to] of replacements) {
  content = content.split(from).join(to);
}

fs.writeFileSync(file, content);
console.log('Replacements done!');
