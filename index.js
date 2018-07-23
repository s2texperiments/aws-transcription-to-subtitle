//todo: implement multiline srt
//          but only if lines match from <-> to (+-tolerance)
const moment = require('moment');

function createMaxCharacterPerLineRule(characterPerLine = 40) {
    return (element, newElement) =>
        element.content.length + 1 + newElement.content.length < characterPerLine;
}

function createMaxTimeRule(maxTimeInMs = 1000) {
    return (element, newElement) => newElement.from - element.to < maxTimeInMs;
}

function createMaxLinesRule(maxLines = 2) {
    return (element, newElement) => element.lines < maxLines;
}

function createTimeStamp(ms) {
    let dur = moment.duration(ms);
    return `${
        dur.hours() > 9 ? dur.hours() : '0' + dur.hours()
        }:${
        dur.minutes() > 9 ? dur.minutes() : '0' + dur.minutes()
        }:${
        dur.seconds() > 9 ? dur.seconds() : '0' + dur.seconds()
        }.${
        dur.milliseconds() > 99 ? dur.milliseconds() : dur.milliseconds() > 9 ? '0' + dur.milliseconds() : '00' + dur.milliseconds()
        }`;
}

exports.handler = async (event, {characterPerLine = 40, maxLines = 2, maxTimeInMs = 1000, debug = false} = {}) => {

    if (debug) {
        console.log(`Event: ${JSON.stringify(event)}`);

        console.log(`CharacterPerLine: ${characterPerLine}`);
        console.log(`Max Lines: ${maxLines}`);
        console.log(`Max Time in Ms: ${maxTimeInMs}`);
    }

    let wordsToLineMergeRules = [
        createMaxCharacterPerLineRule(characterPerLine),
        createMaxTimeRule(maxTimeInMs)
    ];

    let multilineMergeRules = [
        createMaxLinesRule(maxLines),
        createMaxTimeRule(maxTimeInMs)
    ];

    return 'WEBVTT\n\n'
        + event.results.items
            .map((e) => ({
                content: e.alternatives[0].content,
                from: Math.floor(parseFloat(e.start_time) * 1000),
                to: Math.floor(parseFloat(e.end_time)) * 1000,
                characterCount: e.alternatives[0].content.length,
                //pronunciation|punctuation
                type: e.type,
                lines: 1
            }))
            .reduce((acc, cur) => {
                if (acc.length === 0) {
                    return [cur]
                }

                let last = acc[acc.length - 1];

                if (cur.type === 'pronunciation') {

                    let shouldMerge = wordsToLineMergeRules
                        .reduce((shouldMerge, rule) => shouldMerge ? rule(last, cur) : false, true);

                    if (shouldMerge) {
                        acc[acc.length - 1] = Object.assign({}, last, {
                            content: `${last.content} ${cur.content}`,
                            to: cur.to,
                            characterCount: last.characterCount + 1 + cur.characterCount
                        });

                        return acc;
                    }
                    return [...acc, cur];
                }
                //cur.type === 'punctuation'
                else {
                    acc[acc.length - 1] = Object.assign({}, last, {
                        content: `${last.content}${cur.content}`,
                        characterCount: last.characterCount + cur.characterCount
                    });
                    return acc;
                }
            }, [])
            .reduce((acc, cur) => {
                if (acc.length === 0) {
                    return [cur];
                }

                let last = acc[acc.length - 1];

                let shouldMerge = multilineMergeRules
                    .reduce((shouldMerge, rule) => shouldMerge ? rule(last, cur) : false, true);

                if (shouldMerge) {
                    acc[acc.length - 1] = Object.assign({}, last, {
                        content: `${last.content}\n${cur.content}`,
                        to: cur.to,
                        characterCount: last.characterCount + cur.characterCount,
                        lines: ++last.lines
                    });
                    return acc;
                }
                return [...acc, cur];

            }, [])
            .reduce((acc, cur, idx) => {

                return [...acc,
                    `${idx + 1} \n` +
                    `${createTimeStamp(cur.from)} --> ${createTimeStamp(cur.to)}\n` +
                    `${cur.content}\n\n`];
            }, [])
            .join('');
};