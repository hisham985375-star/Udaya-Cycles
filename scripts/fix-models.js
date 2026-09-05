const fs = require('fs');
const path = require('path');
const dir = 'src/models';

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.ts')) return;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');

  // Fix broken pattern: mongoose.models?.  ?? mongoose.model<X>("ModelName", ...)
  // The model name was stripped, so we recover it from the mongoose.model() call
  content = content.replace(
    /mongoose\.models\?\.\s*\?\?\s*mongoose\.model<([^>]+)>\("([^"]+)"/g,
    'mongoose.models?.$2 ?? mongoose.model<$1>("$2"'
  );

  fs.writeFileSync(p, content);
  console.log('Fixed: ' + file);
});
console.log('All models fixed!');
