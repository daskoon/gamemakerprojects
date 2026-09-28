const fs = require('fs');
const path = require('path');

function parseGMJson(str) {
    try {
        return eval('(' + str + ')');
    } catch(e) {
        return null;
    }
}

function stringifyGM(obj) {
    // 1. Get all keys and sort them STRICTLY alphabetically
    const keys = Object.keys(obj).sort();
    
    // 2. Build a new object with the sorted keys
    // (Note: JSON.stringify preserves key order in modern Node.js)
    let sortedObj = {};
    keys.forEach(k => {
        let val = obj[k];
        // If the value is an array of objects, sort them recursively
        if (Array.isArray(val)) {
            val = val.map(item => {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    let sortedItem = {};
                    Object.keys(item).sort().forEach(ik => sortedItem[ik] = item[ik]);
                    return sortedItem;
                }
                return item;
            });
        }
        sortedObj[k] = val;
    });

    let json = JSON.stringify(sortedObj, null, 2);
    // 3. Add trailing commas to satisfy GM parser
    return json.replace(/([}\]" \d\w])\n( +[}\]])/g, '$1,\n$2');
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && f !== '.git' && f !== 'gm_mcp') {
            walkDir(dirPath, callback);
        } else if (!isDirectory) {
            callback(dirPath);
        }
    });
}

function fixFile(filePath) {
    if (!filePath.endsWith('.yy') && !filePath.endsWith('.yyp')) return;
    let str = fs.readFileSync(filePath, 'utf8');
    let obj = parseGMJson(str);
    if (!obj) return;
    
    // Convert to v1 format
    let typeTag = Object.keys(obj).find(k => k.startsWith('$GM'));
    if (typeTag) {
        obj[typeTag] = "v1"; // Explicitly v1
    }

    // Standardize naming: Version 2024 uses BOTH name and %Name in v1
    let finalName = obj["%Name"] || obj.name || path.basename(filePath, '.yy');
    obj["%Name"] = finalName;
    obj["name"] = finalName;

    // Standardize version
    obj["resourceVersion"] = "2.0";

    fs.writeFileSync(filePath, stringifyGM(obj));
    console.log("Strict V1 Alphabetized: " + filePath);
}

walkDir('.', fixFile);
console.log("Final V1 Strict Order repair complete.");
