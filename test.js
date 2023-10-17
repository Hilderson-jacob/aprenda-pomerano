const fs = require('fs');
const dir = './sounds';

fs.readdir(dir , (err, arquivos) => {
    ds = []
    arquivos.forEach(arquivo => {
        ds.push(`sounds/${arquivo}`)
    
    });
    console.log(ds);
});
