'use strict';

const program = require('commander')
	, cheerio = require('cheerio')
	, Nightmare = require('nightmare')
	, cliTable = require('cli-table')
	, nightmare = Nightmare({show: false})
	;

var code = 'PJ681760500BR';
var correiosURL = 'http://www2.correios.com.br/sistemas/rastreamento/default.cfm';

getWPackageResult(code, (result) => {
	if(result.status == 'ERROR') {
		console.log(result.message);
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