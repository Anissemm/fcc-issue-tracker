const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
const responseKeys = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', '_id', 'created_on', 'updated_on', 'open']
let _id = null

suite('Functional Tests', function () {
    test('Create an issue with every field', (done) => {
        chai.request(server)
            .post('/api/issues/testissues')
            .send({
                issue_title: 'Test Issue',
                issue_text: 'Test Issue Text',
                created_by: 'Anissem',
                assigned_to: 'No one',
                status_text: 'Status'
            }).end((err, res) => {
                assert.hasAllKeys(res.body, responseKeys)
                done()
            })
    })

    test('Create an issue with only required field', (done) => {
        chai.request(server)
            .post('/api/issues/testissues')
            .send({
                issue_title: 'Test Issue 1',
                issue_text: 'Test Issue Text 1',
                created_by: 'Anissem'
            }).end((err, res) => {
                _id = res.body._id
                assert.hasAllKeys(res.body, responseKeys)
                done()
            })
    })

    test('Create an issue with missing required fields', (done) => {
        chai.request(server)
            .post('/api/issues/testissues')
            .send({
                assigned_to: 'No one',
                status_text: 'Status'
            }).end((err, res) => {
                assert.equal(res.body.error, 'required field(s) missing')
                done()
            })
    })

    console.log(_id)

    test('View issues on a project', (done) => {
        chai.request(server)
            .get('/api/issues/testissues')
            .end((err, res) => {
                assert.isArray(res.body)

                if (res.body.length > 0) {
                    assert.hasAllKeys(res.body[0], responseKeys)
                }
                done()
            })
    })

    test('View issues on a project with one filter', (done) => {
        chai.request(server)
            .get('/api/issues/testissues')
            .query({ open: true })
            .end((err, res) => {
                assert.isArray(res.body)

                if (res.body.length > 0) {
                    assert.hasAllKeys(res.body[0], responseKeys)
                }
                done()
            })
    })

    test('View issues on a project with multiple filters', (done) => {
        chai.request(server)
            .get('/api/issues/testissues')
            .query({ open: true, assigned_to: 'anis' })
            .end((err, res) => {
                assert.isArray(res.body)

                if (res.body.length > 0) {
                    assert.hasAllKeys(res.body[0], responseKeys)
                }
                done()
            })
    })

    test('Update one field on an issue', (done) => {
        chai.request(server)
            .put('/api/issues/testissues')
            .send({
                _id,
                open: false
            })
            .end((err, res) => {
                assert.equal(res.body.result, 'successfully updated')
                done()
            })
    })

    test('Update multiple fields on an issue', (done) => {
        chai.request(server)
            .put('/api/issues/testissues')
            .send({
                _id,
                assigned_to: 'No one',
                created_by: 'aniss',
                open: false
            })
            .end((err, res) => {
                assert.equal(res.body.result, 'successfully updated')
                done()
            })
    })

    test('Update an issue with missing _id', (done) => {
        chai.request(server)
            .put('/api/issues/testissues')
            .send({
                assigned_to: 'No one',
                created_by: 'aniss',
                open: false
            })
            .end((err, res) => {
                assert.equal(res.body.error, 'missing _id')
                done()
            })
    })

    test('Update an issue with no fields to update', (done) => {
        chai.request(server)
            .put('/api/issues/testissues')
            .send({ _id })
            .end((err, res) => {
                assert.equal(res.body.error, 'no update field(s) sent')
                assert.equal(res.body._id, _id)
                done()
            })
    })

    test('Update an issue with an invalid _id', (done) => {
        chai.request(server)
            .put('/api/issues/testissues')
            .send({
                _id: 'invalid',
                assigned_to: 'No one',
                created_by: 'aniss',
                open: false
            })
            .end((err, res) => {
                assert.equal(res.body.error, 'could not update')
                assert.equal(res.body._id, 'invalid')
                done()
            })
    })

    test('Delete an issue', (done) => {
        chai.request(server)
            .delete('/api/issues/testissues')
            .send({ _id })
            .end((err, res) => {
                assert.equal(res.body._id, _id)
                assert.equal(res.body.result, 'successfully deleted')
                done()
            })
    })

    test('Delete an issue with an invalid _id', (done) => {
        chai.request(server)
            .delete('/api/issues/testissues')
            .send({ _id: 'invalid' })
            .end((err, res) => {
                assert.equal(res.body._id, 'invalid')
                assert.equal(res.body.error, 'could not delete')
                done()
            })
    })

    test('Delete an issue with missing _id', (done) => {
        chai.request(server)
            .delete('/api/issues/testissues')
            // .send({ _id: '' })
            .end((err, res) => {
                assert.equal(res.body.error, 'missing _id')
                done()
            })
    })
});
