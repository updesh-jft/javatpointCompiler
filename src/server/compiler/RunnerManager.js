/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const path = require('path');
const fs = require('fs');
const FileApi = require('../api/FileApi');
const CRunner = require('./CRunner');
const CppRunner = require('./CppRunner');
const JavaRunner = require('./JavaRunner');
const JavaScriptRunner = require('./JavaScriptRunner');
const PythonRunner = require('./PythonRunner');

function Factory() {
  this.createRunner = function createRunner(lang) {
    let runner;

    if (lang === 'c') {
      runner = new CRunner();
    } else if (lang === 'c++') {
      runner = new CppRunner();
    } else if (lang === 'java') {
      runner = new JavaRunner();
    } else if (lang === 'javascript') {
      runner = new JavaScriptRunner();
    } else if (lang === 'python') {
      runner = new PythonRunner();
    }

    return runner;
  };
}

const checkJavaScriptFunction = (code) => {
  const functionCall = [];
  const matchCount = code.match(/function/g).length;
  console.log('🚀 ~ file: RunnerManager.js:38 ~ matchCount', matchCount);
  for (let i = 0; i < matchCount; i++) {
    const fun = `${(code.split('function')[i + 1]).split('{')[0]};`;
    if (!fun.includes('script')) {
      functionCall.push(fun);
    }
  }

  return functionCall;
};

module.exports = {
  run(lang, code, res, fileNamee, folderName) {
    function insert(main_string, ins_string, pos) {
      if (typeof (pos) === 'undefined') {
        pos = 0;
      }
      if (typeof (ins_string) === 'undefined') {
        ins_string = '';
      }
      return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
    }
    if (lang === 'xml' || lang === 'html') {
      const directory = path.join(__dirname, '../templates');
      const data = fs.readFileSync(`${directory}/${'html.html'}`, 'utf8');
      if (code.includes('function') || code.includes('Function')) {
        if (!code.includes('</script>')) {
          code = `<script>${code}</script>`;
        }
        const functionCall = checkJavaScriptFunction(code);
        console.log('script', code, functionCall);
        functionCall.push('</script>');
        code = code.replace('</script>', functionCall.toString().replace(/,/g, ''));
      }
      const stream = fs.createWriteStream(`${directory}/${fileNamee}.html`);
      code = lang === 'xml' ? insert(data, code, 29) : code;
      stream.write(code);
      const url = '';
      const fileName = '';
      const result = {
        url,
        fileName
      };
      result.url = `https://javatpoint.tech/compiler/${fileNamee}.html`;
      result.fileName = `${fileNamee}.html`;
      res.end(JSON.stringify(result));
    } else {
      const factory = new Factory();
      const runner = factory.createRunner(lang.toLowerCase());

      const dir = path.join(__dirname, `../templates/${folderName}`);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const directory = dir;
      const file = `${directory}/${fileNamee}`;
      console.log(`file: ${file}`);
      const filename = path.parse(`${directory}/${fileNamee}`).name; // main
      const extension = path.parse(`${directory}/${fileNamee}`).ext; // .java
      console.log(`filename: ${filename}`);
      console.log(`extension: ${extension}`);
      const stream = fs.createWriteStream(`${directory}/${fileNamee}`);
      stream.write(code);
      FileApi.saveFile(file, code, () => {
        runner.run(file, directory, filename, extension, (status, message, output) => {
          const result = {
            status,
            message,
            output,
            filename
          };
          if (status === '1') {
            res.end(JSON.stringify(result));
          }
        });
      });
    }
  },
};

