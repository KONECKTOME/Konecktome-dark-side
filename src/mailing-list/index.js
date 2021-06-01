const router = require('express').Router()
const mailListModel = require('../mailing-list/schema')
const mongoose = require('mongoose')
const Nylas = require('nylas')
const mailchimp = require('@mailchimp/mailchimp_marketing')

Nylas.config({
    clientId: process.env.NYLAS_CLIENT_ID,
    clientSecret: process.env.NYLAS_CLIENT_SECRET,
})
const nylas = Nylas.with(process.env.NYLAS_ACCESS_TOKEN)

mailchimp.setConfig({
    apiKey: process.env.MAIL_CHIMP_API_KEY,
    server: process.env.MAIL_CHIMP_SERVER,
})

function isValidEmail(email) {
    var mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if (email.match(mailformat)) {
        return true
    } else {
        return false
    }
}

router.get('/', async(req, res) => {
    try {
        const allList = await mailListModel.find()
        res.send(allList)
    } catch (error) {
        console.log(error)
    }
})

router.post('/new-user', async(req, res) => {
    const { name, email } = req.body

    try {
        if (name === '' || email === '') {
            res.json({ message: "Text fields can't be empty" })
        } else if (isValidEmail(email) === false) {
            res.json({
                message: 'Invalid email',
            })
        } else {
            const findUser = await mailListModel.find({ email: email })
            if (findUser.length !== 0) {
                res.json({
                    message: 'This email already exists',
                })
            } else {
                const newUser = await mailListModel.create({
                    name: name,
                    email: email,
                })
                res.json({
                    message: 'Sign up successful',
                })
            }
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/marketing', async(req, res) => {
    const { name, email } = req.body
    try {
        const listId = process.env.MAIL_CHIMP_LIST_ID
        const response = await mailchimp.lists.addListMember(listId, {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: name,
            },
        })
        if (response.statusCode === 400) {
            res.json({ message: 'An errored in adding to mail list' })
        } else {
            res.json({ message: 'Successfully added to mail list' })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/transactional', async(req, res) => {
    const { email, name } = req.body
    try {
        const draft = nylas.drafts.build({
            subject: 'With Love, from Nylas',
            body: 'This email was sent using the Nylas email API. Visit https://nylas.com for details.',
            to: [{ name: name, email: email }],
        })
        draft.send().then((message) => {
            if (message.folder.name === 'sent') {
                res.json({
                    meesage: 'Email sent',
                })
            } else {
                res.json({
                    message: 'Error sending email',
                })
            }
        })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router