'use strict';

var cheerio = require('cheerio')
	, Nightmare = require('nightmare')
	;

module.exports = function() {
	var nightmare = Nightmare({show: false});

	var correiosURL = 'http://www2.correios.com.br/sistemas/rastreamento/default.cfm';
	var self = this;

	self.getPackage = function(packageCode, callback) {
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
				if($("button:contains('Nova Consulta')").length == 0) {
					return {
						'status' : 'ERROR',
						'message' : 'Código inválido'
					};
				}

				return $(".listEvent").html();
			})
		    .end()
		    .then(function(result) {
		    	var result = result;
		    	if(result['status'] != 'ERROR')
		    		result = getEvents(result);

		    	if(callback !== undefined)
		    		callback(result);
		    })
		    .catch(function(error) {
		        console.error('Search failed:', error);
		    });
	}

	self.show = function(show) {
		if(show != undefined) {
			nightmare.options.show = show;
		}

		return nightmare.options.show;
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
}

// module.exports = {
// 	getPackage: getPackage
// 	, show: show
// };