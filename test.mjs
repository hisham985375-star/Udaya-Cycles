import http from 'http';

const req = http.request('http://localhost:3000/api/admin/bulk-import-upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', data));
});
req.write('------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n');
req.write('Content-Disposition: form-data; name="files"; filename="test.pdf"\r\n');
req.write('Content-Type: application/pdf\r\n\r\n');
req.write('%PDF-1.4\n%EOF\r\n');
req.write('------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n');
req.end();
