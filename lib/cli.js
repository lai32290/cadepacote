'use strict';

const program = require('commander')
	, cheerio = require('cheerio')
	, Nightmare = require('nightmare')
	, cTable = require('konsole.table')
	, bConsole = require('better-console')
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
        cTable(events);
    })
    .catch((error) => {
        console.error('Search failed:', error);
    });


function pegarEventos(html) {
	var events = [];
	var $ = cheerio.load(html);

	$('tbody tr').each((index, element) => {
		var event = {
			time: $(element).find('.sroDtEvent').text().trim(),
			description: $(element).find('.sroLbEvent').text().trim().replace(/\s*[\n\t]\s*/g, ' ')
		};

		events.push(event);
	});

	return events;
}