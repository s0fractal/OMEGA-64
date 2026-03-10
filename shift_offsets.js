const fs = require('fs');
let code = fs.readFileSync('OFFSETS.ts', 'utf8');

const lines = code.split('\n');
for (let i = 43; i <= 74; i++) { // Lines 44..75 (0-indexed 43..74)
    let line = lines[i];
    if (line.includes('SAFETY_BUFFER + ')) {
        lines[i] = line.replace(/SAFETY_BUFFER \+ (\d+)/, (match, p1) => {
            let val = parseInt(p1, 10);
            return 'SAFETY_BUFFER + ' + (val + 2000000);
        });
    }
}

fs.writeFileSync('OFFSETS.ts', lines.join('\n'));
