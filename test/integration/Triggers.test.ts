import * as postmark from '../../src/index';

import { expect } from 'chai';
import 'mocha';
import { CreateTagTriggerRequest, CreateInboundRuleRequest } from '../../src/client/models';

const nconf = require('nconf');
const testingKeys = nconf.env().file({ file: __dirname + '/../../testing_keys.json' });

describe('Client - Triggers', function () {
    const serverToken: string = testingKeys.get('SERVER_TOKEN');
    let client = new postmark.ServerClient(serverToken);
    const triggerName: string = 'node-js';

    function tagTriggerToTest() {
        return new CreateTagTriggerRequest(`${triggerName}_${Date.now()}`, true)
    };

    function inboundRuleTriggerToTest() {
        return new CreateInboundRuleRequest(`${triggerName}-${Date.now()}.com`);
    };

    async function cleanupTagTriggers() {
        let tagTriggers = await client.getTagTriggers();

        for (let i = 0; i < tagTriggers.Tags.length; i++) {
            let tagTrigger = tagTriggers.Tags[i];
            if (tagTrigger.MatchName.includes(triggerName)) {
                await client.deleteTagTrigger(tagTrigger.ID);
            };
        };
    };

    async function cleanupInboundRuleTriggers() {
        let inboundRuleTriggers = await client.getInboundRuleTriggers();

        for (let i = 0; i < inboundRuleTriggers.InboundRules.length; i++) {
            let inboundRuleTrigger = inboundRuleTriggers.InboundRules[i];
            if (inboundRuleTrigger.Rule.includes(triggerName)) {
                await client.deleteInboundRuleTrigger(inboundRuleTrigger.ID);
            };
        };
    }

    async function cleanup() {
        await cleanupTagTriggers();
        await cleanupInboundRuleTriggers();
    };

    before(cleanup);
    after(cleanup);

    it('createTagTrigger', async () => {
        const tagTriggerOptions = tagTriggerToTest();
        const result = await client.createTagTrigger(tagTriggerOptions);
        expect(result.MatchName).to.equal(tagTriggerOptions.MatchName);
    });

    it('editTagTrigger', async () => {
        const tagTriggerOptions = tagTriggerToTest();
        const editMatchName: string = `${tagTriggerOptions.MatchName}-updated`;
        const tagTrigger = await client.createTagTrigger(tagTriggerOptions);

        const tagTriggerDetails = await client.editTagTrigger(tagTrigger.ID, { MatchName: editMatchName })
        expect(tagTriggerDetails.MatchName).to.equal(editMatchName);
    });

    it('deleteTagTrigger', async () => {
        const tagTriggerOptions = tagTriggerToTest();
        const tagTrigger = await client.createTagTrigger(tagTriggerOptions);

        const response = await client.deleteTagTrigger(tagTrigger.ID);
        expect(response.Message.length).to.above(0);
    });

    it('getTagTriggers', async () => {
        const tagTriggerOptions = tagTriggerToTest();
        await client.createTagTrigger(tagTriggerOptions);

        const tagTriggers = await client.getTagTriggers();
        expect(tagTriggers.Tags.length).to.above(0);
    });

    it('getTagTrigger', async () => {
        const tagTriggerOptions = tagTriggerToTest();
        await client.createTagTrigger(tagTriggerOptions);

        const tagTriggers = await client.getTagTriggers();
        const tagTrigger = await client.getTagTrigger(tagTriggers.Tags[0].ID);
        expect(tagTrigger.ID).to.above(0);
    });

    it('createInboundRuleTrigger', async () => {
        const inboundRuleTriggerOptions = inboundRuleTriggerToTest();
        const result = await client.createInboundRuleTrigger(inboundRuleTriggerOptions);
        expect(result.Rule).to.equal(inboundRuleTriggerOptions.Rule);
    });

    it('getInboundRuleTriggers', async () => {
        const inboundRules = await client.getInboundRuleTriggers();
        expect(inboundRules.InboundRules.length).to.gte(0);
    });

    it('deleteInboundRuleTrigger', async () => {
        const inboundRuleTriggerOptions = inboundRuleTriggerToTest();
        const inboundRule = await client.createInboundRuleTrigger(inboundRuleTriggerOptions);

        const response = await client.deleteInboundRuleTrigger(inboundRule.ID);
        expect(response.Message.length).to.above(0);
    });
});