const fs = require('fs');
const path = require('path');
const dir = 'src/models';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.ts')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    // Fix the broken replacement
    content = content.replace(/mongoose\.models\?\.\s*\?\?/g, () => {
      // Find the model name from the mongoose.model<...> or mongoose.model("...") call
      return 'mongoose.models?.' + file.replace('.ts', '') + ' ??';
    });
    // Also fix any remaining mongoose.models.User that weren't touched
    content = content.replace(/mongoose\.models\.([A-Za-z0-9_]+)/g, 'mongoose.models?.$1');
    fs.writeFileSync(p, content);
  }
});
console.log('Fixed mongoose models!');
