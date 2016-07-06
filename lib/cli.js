'use strict';

const program = require('commander')
	, cheerio = require('cheerio')
	, Nightmare = require('nightmare')
	, cliTable = require('cli-table')
	, nightmare = Nightmare({show: false})
	;

var codigo = 'PJ681760500BR';
var url = 'http://www2.correios.com.br/sistemas/rastreamento/default.cfm';

nightmare
	.goto(url)
	.evaluate((codigo) => {
		$("#objetos").val(codigo);
		$("#sroForm").submit();
	}, codigo)
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
    	if(result.status == 'ERROR') {
    		console.log(result.message);
    		return;
    	}

    	var events = pegarEventos(result);

    	printResult(events);
    })
    .catch((error) => {
        console.error('Search failed:', error);
    });

function printResult(results) {
	var table = new cliTable({
		head: ['Data/Hora', 'Status']
	});
	results.forEach(function(item) {
		table.push([item['data-hora'], item['status']]);
	});
	console.log(table.toString());
}

function pegarEventos(html) {
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