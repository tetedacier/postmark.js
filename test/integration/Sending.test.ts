import * as postmark from '../../src/index';

import { expect } from 'chai';
import 'mocha';

const nconf = require('nconf');
const testingKeys = nconf.env().file({ file: __dirname + '/../../testing_keys.json' });

describe('Sending', function () {
    const serverToken: string = testingKeys.get('SERVER_TOKEN');
    const client = new postmark.ServerClient(serverToken);

    const fromAddress: string = testingKeys.get('SENDER_EMAIL_ADDRESS');
    const toAddress: string = testingKeys.get('EMAIL_RECIPIENT_ADDRESS');

    function messageToSend() {
        return new postmark.Models.Message(fromAddress, 'Test subject', 'Test html body', undefined, toAddress);
    };

    it('sendEmail', async () => {
        const response = await client.sendEmail(messageToSend());
        expect(response.Message).to.equal('OK')
    });

    it('sendEmailBatch', async () => {
        const messages = Array.from({ length: 3 }, () => messageToSend())
        const responses = await client.sendEmailBatch(messages);

        expect(responses[0].Message).to.equal('OK');
        expect(responses.length).to.equal(3);
    });

    describe('invalid', () => {
        it('sendEmail', () => {
            let message = messageToSend();
            message.HtmlBody = undefined;

            return client.sendEmail(message).then(result => {
                expect(result).to.equal(undefined);
            }).catch(error => {
                expect(error.name).to.equal('ApiInputError');
            });
        });
    });
});