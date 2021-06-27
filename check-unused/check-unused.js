const fs = require("fs/promises");

(async () => {
  const args = process.argv.slice(2).join(' ');
  
  const dirToCheck = args.match(/(--dir|-d) [^ ]*/g)?.[0]?.split(' ')?.[1];
  if(!dirToCheck) throw new Error('Specify --dir or -d options.');

  const stylePath = args.match(/(--style|-s) [^ ]*/g)?.[0]?.split(' ')?.[1];
  if(!stylePath) throw new Error('Specify --style or -s options.');

  const filesToCheck = args.match(/(--files|-f).[^-]*/g)?.[0]?.split(' ')?.slice(1);
  if(!filesToCheck) throw new Error('Specify --files or -f options.');

  const styleFile = await fs.readFile(`${dirToCheck}${stylePath}`);
  const screenFiles = await Promise.all(
    filesToCheck.map((elem) => fs.readFile(`${dirToCheck}${elem}`))
  );

  const styles = styleFile
    .toString()
    .match(/[aA-zZ]*: \{/g)
    .map((elem) => elem.split(":")[0]);

  const stylesOnScreens = screenFiles.map((screenFile) =>
    screenFile
      .toString()
      .match(/styles\.[aA-zZ]*/g)
      .map((elem) => elem.split("styles.")[1])
  );

  const setOfStylesOnScreens = new Set(
    stylesOnScreens.reduce((acc, cur) => [...acc, ...cur], [])
  );

  const stylesUsed = styles.map((elem) => {
    found = setOfStylesOnScreens.has(elem);
    const color = found ? "\x1b[36m%s\x1b[0m" : "\x1b[31m%s\x1b[0m";
    return [color, elem];
  });

  console.log("\x1b[32m%s\x1b[0m", "styles:\n");
  stylesUsed.forEach((elem) => console.log(elem[0], elem[1]));
})().catch((err) =>
  console.log(
    "\x1b[31m%s\x1b[0m",
    "This script has suffered severe damage and cannot recover from it:\n",
    err.message
  )
);
