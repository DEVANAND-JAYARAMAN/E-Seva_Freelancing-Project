const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('Page.tsx') && !file.includes('ServicesPage.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'frontend/src/screens/services'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const stateRegex = /const \[([a-zA-Z]+List),\s*set([a-zA-Z]+List)\]\s*=\s*useState<\s*([a-zA-Z]+)\[\]\s*>\(([\s\S]*?\])\);/;
    
    if (stateRegex.test(content)) {
        console.log('Processing: ' + file);
        if (!content.includes('useCategoryServices')) {
            content = content.replace(
                /import { useState } from ["']react["'];/,
                `import { useState } from "react";\nimport { useCategoryServices } from "../../../hooks/useCategoryServices";`
            );
        }
        content = content.replace(stateRegex, (match, stateName, setterName, typeName, defaultArray) => {
            const folderName = path.basename(path.dirname(file));
            return `const [${stateName}, set${setterName}] = useCategoryServices<${typeName}>(\n    "${folderName}",\n    ${defaultArray}\n  );`;
        });
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Done 2!');
