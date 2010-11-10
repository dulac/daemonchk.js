var net = require('net');
var http = require('http');
var fs = require('fs');

var address = '127.0.0.1';
var daemons = []; // our array of services

// the Daemon object holds service name and port
function Daemon(name, port) {
	this.name = name;
	this.port = port;
}

// add new Daemon objects to array
daemons.push(new Daemon('smtp', 25));
daemons.push(new Daemon('pop3', 110));
daemons.push(new Daemon('imap4', 143));
daemons.push(new Daemon('http', 80));
daemons.push(new Daemon('ftp', 21));
daemons.push(new Daemon('mysql', 3306));
daemons.push(new Daemon('whm', 2086));

var tcpnum = daemons.length; // the number of daemons
var status = 0; // how many daemons we have checked

http.createServer(function (req, res) {

	// send the HTML & CSS to start the response
	fs.readFile('index.html', 'binary', function(err, data) {
		if(err) {
			// if there was an error, respond with HTTP 500
			res.writeHead(500, {'Content-Type': 'text/html'});
			res.end('<h1>Internal Server Error</h1>');
			return;
		}else {
			// success, send the file with HTTP 200
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(data, 'binary'); // send file
		}
	});

	// loop through each daemon
	daemons.forEach(function(d) {

		// create the TCP stream to address:port
		var stream = net.createConnection(d.port, address);
	
		// listen for connection
		stream.on('connect', function() {
	
			// connection success
			res.write('\t\t<div class="greenbox"></div>\n');

			stream.end(); // close the stream
			
			status++; // track number of checked daemons 
			
			if(status == tcpnum) {
				res.write('\t</div>\n</div>\n</body></html>')
				res.end(); // close response
			}
		});
	
		// listen for any errors
		stream.on('error', function(error) {
		
			// connection error
			res.write('\t\t<div class="redbox"><span class="service">'+d.name+'</span></div>\n');
		
			stream.destroy(); // close the stream
			// note: we use destroy() because of the errors
			
			status++; // track number of checked daemons 
			
			if(status == tcpnum) {
				res.write('\t</div>\n</div>\n</body></html>')
				res.end(); // close response
			}
		})


	});//end forEach()


}).listen(8124);
console.log('Daemon Monitor Running...');


