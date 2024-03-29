const router = require("express").Router();
const mailListModel = require("../mailing-list/schema");
const mongoose = require("mongoose");
const Nylas = require("nylas");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.KONECKTOME_HELLO);

mailchimp.setConfig({
  apiKey: process.env.MAIL_CHIMP_API_KEY,
  server: process.env.MAIL_CHIMP_SERVER_PREFIX,
});

function paginator(items, current_page, per_page_items) {
  let page = current_page || 1,
    per_page = per_page_items || 10,
    offset = (page - 1) * per_page,
    paginatedItems = items.slice(offset).slice(0, per_page_items),
    total_pages = Math.ceil(items.length / per_page);

  return {
    page: page,
    per_page: per_page,
    pre_page: page - 1 ? page - 1 : null,
    next_page: total_pages > page ? page + 1 : null,
    total: items.length,
    total_pages: total_pages,
    data: paginatedItems,
  };
}

function isValidEmail(email) {
  var mailformat =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(mailformat)) {
    return true;
  } else {
    return false;
  }
}

router.get("/", async (req, res) => {
  try {
    const allList = await mailListModel.find();
    res.send(allList);
  } catch (error) {
    console.log(error);
  }
});

router.post("/new-user", async (req, res) => {
  const { fName, lName, email } = req.body;
  try {
    if (fName === "" || lName === "" || email === "") {
      res.json({ message: "Text fields can't be empty" });
    } else if (isValidEmail(email) === false) {
      res.json({
        message: "Invalid email",
      });
    } else {
      const findUser = await mailListModel.find({ email: email });
      if (findUser.length !== 0) {
        res.json({
          message: "This email already exists",
        });
      } else {
        const newUser = await mailListModel.create({
          fName,
          lName,
          email,
        });
        res.json({
          message: "Sign up successful",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/marketing", async (req, res) => {
  const { fName, lName, email } = req.body;

  try {
    const listId = process.env.MAIL_CHIMP_LIST_ID;
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: fName,
      },
    });
    if (response.statusCode === 400) {
      res.json({ message: "An errored in adding to mail list" });
    } else {
      res.json({ message: "Successfully added to mail list" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/transactional", async (req, res) => {
  const { fName, lName, email } = req.body;

  const msg = {
    to: email,
    from: "timothy.mide@konecktome.com",
    subject: "Let’s begin our journey together",
    html: `<div>
    <h3>Congratulations ${fName}, welcome to the KONECKTOME family!</h3>
    <p>If you’re receiving this email, it means you’re now officially a proud member of the KONECKTOME family! </p>
    <p> We’re extremely excited you’re able to be part of our ‘Road To Launch’ journey where you’ll get to know and experience what being part of our family means and what we stand for.
           Expect some exciting and engaging content coming your way that will make you feel more ‘koneckted’ than ever before.</p>
      <p>Stop yourself from missing out on awesome content by making sure you’ve got our email address saved to your contact or address book. 
             This stops our emails from being accidentally marked as spam when you receive them.</p>
      <p>Why not also invite your friends and family to be part of our awesome family journey.</p>
    <p>Catch you soon,</p>
    <p>The founding team</p>
    </div>`,
  };
  sgMail
    .send(msg)
    .then(async () => {
      res.json({
        message: "Email sent",
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

// router.post('/transactional', async(req, res) => {
//     const { email, name } = req.body
//     try {
//         const draft = nylas.drafts.build({
//             subject: 'With Love, from Nylas',
//             body: 'This email was sent using the Nylas email API. Visit https://nylas.com for details.',
//             to: [{ name: name, email: email }],
//         })
//         draft.send().then((message) => {
//             if (message.folder.name === 'sent') {
//                 res.json({
//                     meesage: 'Email sent',
//                 })
//             } else {
//                 res.json({
//                     message: 'Error sending email',
//                 })
//             }
//         })
//     } catch (error) {
//         console.log(error)
//     }
// })

module.exports = router;
