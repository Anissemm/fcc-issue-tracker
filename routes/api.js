const { ObjectId } = require('mongodb')
module.exports = function (app, issuesCollection) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      const { open } = req.query
      const parsedOpen = open === 'true' ? true : open === 'false' ? false : null

      const foundIssues = await issuesCollection.find({
        ...req.query,
        open: parsedOpen  
      })

      const response = await foundIssues.toArray()
      console.log(response)
      return res.send(response)
    })

    .post(async function (req, res) {
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text } = req.body

      if (!issue_title || !issue_text || !created_by) {
        return res.send({ error: 'required field(s) missing' })
      }

      const { insertedId } = await issuesCollection.insertOne({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to ? assigned_to : '',
        status_text: status_text ? status_text : '',
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      }, { new: true })

      const issue = await issuesCollection.findOne({ _id: insertedId })

      return res.send(issue)
    })


    .put(async function (req, res) {
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body

      try {

        if (!_id) {
          return res.send({ error: 'missing _id' })
        }

        const values = Object.entries(req.body).reduce((obj, item) => {
          if (item[1] && item[0] !== '_id') obj[item[0]] = item[1]
          return obj
        }, {})

        if (Object.keys(values).length <= 1) {
          return res.send({
            error: 'no update field(s) sent',
            _id
          })
        } else {
          const presentIssue = await issuesCollection.findOne({ _id: new ObjectId(_id) })

          if (!presentIssue) {
            return res.send({
              error: 'could not update',
              _id
            })
          }

          await issuesCollection.updateOne({ _id: presentIssue._id }, {
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
      try {

        if (!_id) {
          return res.send({ error: 'missing _id' })
        }

        const presentIssue = await issuesCollection.findOne({ _id: new ObjectId(_id) })

        if (!presentIssue) {
          return res.send({ error: 'could not delete', _id })
        }

        const result = await issuesCollection.deleteOne({ _id: new ObjectId(_id) })

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
