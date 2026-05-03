const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

fs.writeFileSync('test.csv', 'colaborador,data,hora,qtd\nFabricio,2026-05-03,10:00,1\n');

const form = new FormData();
form.append('file', fs.createReadStream('test.csv'));

const req = http.request('http://0.0.0.0:3000/api/upload', {
  method: 'POST',
  headers: form.getHeaders(),
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
});
form.pipe(req);
