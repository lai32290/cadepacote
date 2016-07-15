var assert = require('chai').assert
	, Cadepacote = require('../modules/cadepacote.js')
	;

describe('CadePacote', function() {

	this.timeout(10000);
	
	it('Changing show option', () => {
		var cadepacote = new Cadepacote();

		cadepacote.show(true);

		assert.equal(true, cadepacote.show());
	});

	it('Return Sucess', (done) => {
		var cadepacote = new Cadepacote();

		var code = 'PJ681760500BR';
		cadepacote.getPackage(code, (result) => {
			assert.notProperty(result, 'status', result.message);
			done();
		});
	});

	it('Invalid Code', (done) => {
		var cadepacote = new Cadepacote();

		var code = 'PJ681760500BR321';
		cadepacote.getPackage(code, (result) => {
			assert.property(result, 'status', result.message);
			done();
		});
	});
});