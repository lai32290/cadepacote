'use strict';

var program = require('commander')
	, pkg = require('../package.json')
	, cliTable = require('cli-table')
	, colors = require('colors')
	, Cadepacote = require('../modules/cadepacote.js')
	, cadepacote = new Cadepacote()
	, showWindow = false;
	;

var code =  undefined;
program
	.version(pkg.version)
	.option('-r, --reverse', 'Reverse event list')
	.option('-v, --verbose', 'Show process message')
	.option('-w, --window', 'Show browser')
	.usage("<codigo>")
	.action(function (codigo) {
		code = codigo;
	})
	.parse(process.argv);

showWindow = program.window;

if(code == undefined || code == '') {
	program.outputHelp();
	return;
}

if(program.verbose) console.log('Buscando resultados...');
cadepacote.show(showWindow);
cadepacote.getPackage(code, function(result) {
	if(result['status'] != 'ERROR') {
		printResult(result);
		return;
	}
	console.log(result.message);
});

function printResult(results) {
	var data = JSON.parse(JSON.stringify(results)).reverse();

	if(program.reverse) data = data.reverse();

	data.forEach(function(item) {
		console.log((item.date + '    ' + item.time + '    ' + item.local).underline);
		console.log('Status: ' + item.status.green);
		console.log('');
	});
}