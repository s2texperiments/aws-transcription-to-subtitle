const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();
const fake = require('sinon').fake;
const fs = require('fs');
const dotEnv = require('dotenv');

describe('transcription to vtt', () => {

    let underTest;

    beforeEach(() => {
        dotEnv.config({path: "test/.env"});
        underTest = proxyquire('../index.js', {});
    });

    it('number_as_word_without_gap_with_0.15_per_word_data.json', async () => {
        let result = await underTest.handler(getEvent('number_as_word_without_gap_with_0.15_per_word_data.json'));
        console.log("#####");
        console.log(result);
        // expect(result).to.deep.equal(getExpected("number_as_word_without_gap_with_0.15_per_word_expected_one_line.json"));
    });

    it('se-radio.json', async () => {
        let result = await underTest.handler(getEvent('se-radio.json'));
        console.log("#####");
        console.log(result);
        writeResult(result,'se-radio.vtt');

    });

    it('expert.json', async () => {
        let result = await underTest.handler(getEvent('expert.json'));
        console.log("#####");
        console.log(result);

        writeResult(result,'expert.vtt');

    });

    function getExpected(file) {
        return JSON.parse(fs.readFileSync(`test/data/${file}`, 'utf8'))
    }

    function getEvent(file) {
        return JSON.parse(fs.readFileSync(`test/data/${file}`, 'utf8'))
    }

    function writeResult(result,file) {
        fs.writeFileSync(`test/data/${file}`, result);
    }

});