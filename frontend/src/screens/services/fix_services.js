const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);

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

const files = walk(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // We look for: const [somethingServicesList, setSomethingServicesList] = useState<SomethingService[]>([ ... ]);
    // The regex to match the state initialization.
    const stateRegex = /const \[([a-zA-Z]+ServicesList),\s*set([a-zA-Z]+ServicesList)\]\s*=\s*useState<\s*([a-zA-Z]+Service)\[\]\s*>\(([\s\S]*?\])\);/;
    
    if (stateRegex.test(content)) {
        console.log('Processing: ' + file);
        
        // Add import
        if (!content.includes('useCategoryServices')) {
            content = content.replace(
                /import { useState } from ["']react["'];/,
                `import { useState } from "react";\nimport { useCategoryServices } from "../../../hooks/useCategoryServices";`
            );
        }

        content = content.replace(stateRegex, (match, stateName, setterName, typeName, defaultArray) => {
            // we need to get the category name. We can guess it from the folder name.
            const folderName = path.basename(path.dirname(file));
            
            return `const [${stateName}, set${setterName}] = useCategoryServices<${typeName}>(\n    "${folderName}",\n    ${defaultArray}\n  );`;
        });

        fs.writeFileSync(file, content, 'utf8');
        changed = true;
    }
});
console.log('Done!');
