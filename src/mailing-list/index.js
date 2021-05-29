const router = require('express').Router()
const mailListModel = require('../mailing-list/schema')
const mongoose = require('mongoose')
const mailchimp = require('@mailchimp/mailchimp_marketing')
const mailchimpTx = require('@mailchimp/mailchimp_transactional')(
    '37b25d80a403ffba449e2dab6e454f17-us6',
)
const nodemailer = require('nodemailer')

mailchimp.setConfig({
    apiKey: process.env.MAIL_CHIMP_API_KEY,
    server: process.env.MAIL_CHIMP_SERVER,
})

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
    } catch (error) {
        console.log(error)
    }
})

router.post('/marketing', async(req, res) => {
    const { name, email } = req.body
    try {
        const listId = process.env.MAIL_CHIMP_LIST_ID
        const subscribingUser = {
            firstName: 'Prudence',
            lastName: 'McVankab',
            email: 'findAssured@outlook.com',
        }
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
    try {
        const message = {
            from_email: 'hello@example.com',
            subject: 'Hello world',
            text: 'Welcome to Mailchimp Transactional!',
            to: [{
                email: 'freddie@example.com',
                type: 'to',
            }, ],
        }
        const response = await mailchimpTx.messages.send({
            message,
        })
        console.log(response)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router