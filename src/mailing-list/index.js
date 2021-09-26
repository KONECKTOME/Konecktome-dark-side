const router = require("express").Router();
const mailListModel = require("../mailing-list/schema");
const mongoose = require("mongoose");
const Nylas = require("nylas");
const mailchimp = require("@mailchimp/mailchimp_marketing");

// Nylas.config({
//     clientId: process.env.NYLAS_CLIENT_ID,
//     clientSecret: process.env.NYLAS_CLIENT_SECRET,
// })
// const nylas = Nylas.with(process.env.NYLAS_ACCESS_TOKEN)

mailchimp.setConfig({
  apiKey: process.env.MAIL_CHIMP_API_KEY,
  server: process.env.MAIL_CHIMP_SERVER,
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
  const { name, email } = req.body;
  try {
    const listId = process.env.MAIL_CHIMP_LIST_ID;
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: name,
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

router.post("/test", async (req, res) => {
  let products = [
    {
      id: 1,
      name: "Product 1",
    },
    {
      id: 2,
      name: "Product 2",
    },
    {
      id: 3,
      name: "Product 3",
    },
    {
      id: 4,
      name: "Product 4",
    },
    {
      id: 5,
      name: "Product 5",
    },
    {
      id: 6,
      name: "Product 6",
    },
    {
      id: 6,
      name: "Product 6",
    },
    {
      id: 6,
      name: "Product 6",
    },
    {
      id: 6,
      name: "Product 6",
    },
    {
      id: 6,
      name: "Product 6",
    },
    {
      id: 6,
      name: "Product 6",
    },
  ];
  res.send(paginator(products, 3, 3));
});

module.exports = router;
