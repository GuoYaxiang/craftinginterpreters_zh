const fs = require('fs')
const path = require('path')

const comparator1 = ['I', '1', '2', '3', 'II', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', 'III', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
const comparator2 = ["后记.md", "附录I.md", "附录II.md"]

const arr = fs.readdirSync('./content');
const item_list = arr.filter(f => /.+\.md/.test(f))

const list_body = item_list.filter(n => /^([0-9iI]+\.)/.test(n))
const list_afterword = item_list.filter(n => !/^([0-9iI]+\.)/.test(n))

console.log(list_body);
console.log(list_body.map(n => n.match(/^([0-9iI]+)/)[0]));
console.log(list_afterword);

list_body.sort((a, b) => (f=>(f(a)-f(b)))(n=>comparator1.indexOf(n.match(/^([0-9iI]+)/)[0])))
list_afterword.sort((a, b) => (f=>f(a)-f(b))(n=>comparator2.indexOf(n)))

fs.writeFileSync('./_sidebar.md', ['* [0.README](README.md)', ...[...list_body, ...list_afterword].map(f => `* [${f.match(/(.*)(?=\.md)/)[0]}](/content/${encodeURI(f)})`)].join('\n'))