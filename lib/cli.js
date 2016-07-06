'use strict';

const program = require('commander')
	, pkg = require('../package.json')
	, cheerio = require('cheerio')
	, Nightmare = require('nightmare')
	, cliTable = require('cli-table')
	, nightmare = Nightmare({show: false})
	;

const correiosURL = 'http://www2.correios.com.br/sistemas/rastreamento/default.cfm';
var code = '';

program
	.version(pkg.version)
	.option('-v, --verbose', 'Show process message')
	.usage("<codigo>")
	.action((codigo) => {
		code = codigo;
	})
	.parse(process.argv);

if(code === undefined || code == '') {
	console.log('Códio de rastreio não informado.');
	return;
}

if(program.verbose) console.log('Buscando resultados...');
getWPackageResult(code, (result) => {
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
		.evaluate((packageCode) => {
			$("#objetos").val(packageCode);
			$("#sroForm").submit();
		}, packageCode)
		.wait(1000)
		.evaluate(() => {
			if($("h3:contains('Rastreamento de objetos')").length > 0) {
				return {
					'status' : 'ERROR',
					'message' : 'Rastreamento de objetos'
				};
			}

			return $(".listEvent").html();
		})
	    .end()
	    .then((result) => {
	    	if(callback !== undefined)
	    		callback(result);
	    })
	    .catch((error) => {
	        console.error('Search failed:', error);
	    });
}

function printResult(results) {
	var table = new cliTable({
		head: ['Data/Hora', 'Status']
	});

	results.forEach((item) => {
		table.push([item['data-hora'], item['status']]);
	});
	console.log(table.toString());
}

function getEvents(html) {
	var events = [];
	var $ = cheerio.load(html);

	$('tbody tr').each((index, element) => {
		var event = {
			'data-hora': $(element).find('.sroDtEvent').text().trim(),
			'status': $(element).find('.sroLbEvent').text().trim().replace(/\s*[\n\t]\s*/g, ' ')
		};

		events.push(event);
	});

	return events;
}