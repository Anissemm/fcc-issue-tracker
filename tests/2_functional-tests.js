const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('Create an issue with every field', (done) => {
        chai.request(server)
            .post('/api/issues/issuetracker')
            .send({
                issue_title: 'Test Issue',
                issue_text: 'Test Issue Text',
                created_by: 'Anissem',
                assigned_to: 'No one',
                status_text: 'Status'
            }).end((err, res) => {
                const responseKeys = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', '_id', 'created_on', 'updated_on', 'open']
                assert.hasAllKeys(res.body, responseKeys)
                done()
            })
    })
});
