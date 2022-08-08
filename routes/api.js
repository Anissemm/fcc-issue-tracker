const { ObjectId } = require('mongodb')
module.exports = function (app, issuesDb) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      const { project } = req.params
      const { open } = req.query

      if (typeof open === 'string') {
        req.query.open = open === 'true' ? true : open === 'false' ? false : undefined
      }

      const issues = issuesDb.collection(project)


      if (req.query._id) {
        req.query._id = new ObjectId(req.query._id)
      }

      const foundIssues = await issues.find(req.query)

      const response = await foundIssues.toArray()

      return res.send(response)
    })

    .post(async function (req, res) {
      const { project } = req.params
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text } = req.body

      if (!issue_title || !issue_text || !created_by) {
        return res.send({ error: 'required field(s) missing' })
      }

      const issues = issuesDb.collection(project)

      const { insertedId } = await issues.insertOne({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to ? assigned_to : '',
        status_text: status_text ? status_text : '',
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      }, { new: true })

      const issue = await issues.findOne({ _id: insertedId })

      return res.send(issue)
    })


    .put(async function (req, res) {
      const { project } = req.params
      const { _id } = req.body
      const issues = issuesDb.collection(project)

      try {

        if (!_id) {
          return res.send({ error: 'missing _id' })
        }

        const values = Object.entries(req.body).reduce((obj, item) => {
          if (item[1] && item[0] !== '_id' || item[0] === 'open') obj[item[0]] = item[1]
          return obj
        }, {})

        if (Object.keys(values).length < 1) {
          return res.send({
            error: 'no update field(s) sent',
            _id
          })
        } else {
          const presentIssue = await issues.findOne({ _id: new ObjectId(_id) })

          if (!presentIssue) {
            return res.send({
              error: 'could not update',
              _id
            })
          }

          await issues.updateOne({ _id: presentIssue._id }, {
            $set: {
              ...values,
              updated_on: new Date()
            }
          })

          return res.send({ result: 'successfully updated', _id })

        }
      } catch (error) {
        return res.send({ error: 'could not update', _id })
      }
    })

    .delete(async function (req, res) {
      const { _id } = req.body
      const { project } = req.params
      const issues = issuesDb.collection(project)

      try {

        if (!_id) {
          return res.send({ error: 'missing _id' })
        }

        const presentIssue = await issues.findOne({ _id: new ObjectId(_id) })

        if (!presentIssue) {
          return res.send({ error: 'could not delete', _id })
        }

        const result = await issues.deleteOne({ _id: new ObjectId(_id) })

        if (result.deletedCount === 1) {
          return res.send({
            result: "successfully deleted",
            _id
          })
        }

        return res.send({
          error: 'could not delete',
          _id
        })
      } catch (error) {
        return res.send({ error: 'could not delete', _id })
      }

    });

};
