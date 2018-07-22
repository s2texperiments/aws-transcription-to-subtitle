const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();
const fake = require('sinon').fake;
const fs = require('fs');

describe('testdata generator', () => {

    it('without gap', async () => {
        let config = {
            name: "number_as_word_without_gap_with_0.15_per_word",
            generatorName: "numberAsWord",
            countEntries: 50,
            accountId: "099687127161",
            jobName: "510_-_269",
            duration_per_word : 0.15
        };


        let contentGenerator = createContentGenerator(config.generatorName);

        let items = [];
        for (let i = 0; i < config.countEntries; i++) {
            items = [...items,
                {
                    "start_time": `${i * config.duration_per_word}`,
                    "end_time": `${(i + 1) * config.duration_per_word}`,
                    "alternatives": [
                        {
                            "confidence": "1.0000",
                            //lorum ipsum generator
                            "content": contentGenerator.next().value
                        }
                    ],
                    "type": "pronunciation"
                }
            ];
        }

        let result = {
            jobName: config.jobName,
            accountId: config.accountId,
            results: {
                transcripts: [],
                items: items
            }
        };

        fs.writeFileSync(`./test/data/${config.name}_data.json`, JSON.stringify(result, null, 2));
        fs.writeFileSync(`./test/data/${config.name}_config.json`, JSON.stringify(config, null, 2));
    });

    function createContentGenerator(name) {

        switch (name) {
            case "number":
                return numbers();
            case "numberAsWord":
                return require('./numberAsWord.js').createGenerator();
            default:
                throw `unknown generator: ${name}`
        }
    }

    function* numbers() {
        let i = 0;
        yield i;
        while (true)
            yield i += 1;
    }
});