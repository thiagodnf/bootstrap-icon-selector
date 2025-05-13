const fs = require('fs');

function saveIcons(name, icons) {

  const fileName = `iconsets/${name}.js`;
  const content = `let ${name} = [${icons.join(",")}];`

  fs.writeFile(fileName, content, error => {
    if (error) {
      console.error(error);
    }
  });
}

fetch("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css")
  .then(res => res.text())
  .then(css => [...css.matchAll(/\.([a-z0-9-]+)::before/gm)].map(m => m[1]))
  .then(icons => [...new Set(icons)])
  .then(icons => [...icons].filter(e => !["bi"].includes(e)))
  .then(icons => [...icons].map(e => `"bi ${e}"`))
  .then(icons => saveIcons("bootstrapIcons", icons));

fetch("https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.css")
  .then(res => res.text())
  .then(css => [...css.matchAll(/^\s*\.([a-z0-9-]+)\.*\s*/gm)].map(m => m[1]))
  .then(icons => [...new Set(icons)])
  .then(icons => [...icons].filter(e => !["fi", "fib"].includes(e)))
  .then(icons => [...icons].map(e => `"fi ${e}"`))
  .then(icons => saveIcons("flagIcons", icons));