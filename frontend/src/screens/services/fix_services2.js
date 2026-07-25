const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

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

    // 1. Inject DynamicForm import if missing
    if (!content.includes('import { DynamicForm }')) {
        content = content.replace(
            /(import [^\n]+;\n)(?=\n|import)/,
            `$1import { DynamicForm } from "../form/DynamicForm";\n`
        );
        changed = true;
    }

    // 2. We need to find where the ternary rendering happens.
    // Usually it looks like:
    // {activeForm === "something" ? (
    //   <Something onCancel={() => setActiveForm(null)} />
    // ) : activeForm === "other" ? (
    //   <Other onCancel={() => setActiveForm(null)} />
    // ) : (
    //   <Last onCancel={() => setActiveForm(null)} />
    // )}
    // OR it ends with `: null}` or `) : activeForm === "last" && (...)`
    
    // It's safer to just let the script do simple replacements if we can identify the end of the render block.
    // However, it's very complex. Let's just fix RtoServicesPage manually to prove it works.
});

console.log('Done!');
