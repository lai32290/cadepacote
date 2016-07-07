'use strict';

var program = require('commander')
	, pkg = require('../package.json')
	, cheerio = require('cheerio')
	, Nightmare = require('nightmare')
	, cliTable = require('cli-table')
	, colors = require('colors')
	, nightmare = Nightmare({show: false})
	;

var correiosURL = 'http://www2.correios.com.br/sistemas/rastreamento/default.cfm';
var code = '';

program
	.version(pkg.version)
	.option('-r, --reverse', 'Reverse event list')
	.option('-v, --verbose', 'Show process message')
	.usage("<codigo>")
	.action(function (codigo) {
		code = codigo;
	})
	.parse(process.argv);

if(code == undefined || code == '') {
	program.outputHelp();
	return;
}

if(program.verbose) console.log('Buscando resultados...');
getWPackageResult(code, function(result) {
	if(result.status == 'ERROR') {
		console.log('Código inválido');
		return;
	}

	var events = getEvents(result);

	printResult(events);
});

function getWPackageResult(packageCode, callback) {
	nightmare
		.goto(correiosURL)
		.evaluate(function(packageCode) {
			$("#objetos").val(packageCode);
			$("#sroForm").submit();
		}, packageCode)
		.wait(function() {
			var href = location.href;
			return href.indexOf('resultado.cfm') >= 0;
		})
		.wait('.ctrlcontent')
		.evaluate(function() {
			if($("button:contains('Nova Consulta')").length < 0) {
				return {
					'status' : 'ERROR',
					'message' : 'Código inválido'
				};
			}

			return $(".listEvent").html();
		})
	    .end()
	    .then(function(result) {
	    	if(callback !== undefined)
	    		callback(result);
	    })
	    .catch(function(error) {
	        console.error('Search failed:', error);
	    });
}

function printResult(results) {
	var data = JSON.parse(JSON.stringify(results)).reverse();

	if(program.reverse) data = data.reverse();

	data.forEach(function(item) {
		console.log((item.date + '    ' + item.time + '    ' + item.local).underline);
		console.log('Status: ' + item.status.green);
		console.log('');
	});
}

function getEvents(html) {
	var events = [];
	var $ = cheerio.load(html);

	$('tbody tr').each(function(index, element) {
		var status = $(element).find('.sroLbEvent').text().trim().replace(/\s*[\n\t]\s*/g, ' ');
		var date = $(element).find('td.sroDtEvent').text();
		date = date.split('\n').filter(function(item) {return item.trim() != ''; });
		
		var event = {
			'date': date[0].trim(),
			'time': date[1].trim(),
			'local': date[2].trim(),
			'status': status
		};

		events.push(event);
	});

	return events;
}