const fs = require('fs');
const path = require('path');

const folderDir = 'folders';
if (!fs.existsSync(folderDir)) fs.mkdirSync(folderDir);

const folders = ["Sprites", "Scripts", "Objects", "Rooms", "Options"];

folders.forEach(name => {
    const yy = {
        "$GMFolder": "",
        "%Name": name,
        "folderPath": `folders/${name}.yy`,
        "name": name,
        "resourceType": "GMFolder",
        "resourceVersion": "2.0"
    };
    
    // Sort keys alphabetically just like the other files
    let sortedYY = {};
    Object.keys(yy).sort().forEach(k => {
        sortedYY[k] = yy[k];
    });

    const json = JSON.stringify(sortedYY, null, 2).replace(/([}\]" \d\w])\n( +[}\]])/g, '$1,\n$2');
    fs.writeFileSync(path.join(folderDir, `${name}.yy`), json);
});

console.log("Folder .yy files created.");
