const YOUR_ACCESS_TOKEN =
  "EAAHQe10a3cwBOZBqbMFeAOqEkZB7K6hvQezTc2vwZBjoz50riUjDJvZCnkZCOVCQ5YgqOHdR91yHZCRkhHm53GpJKwS9FrOYGirju00wfSYJb0dfCpN0Ce4nDJEZBujnA9NAuwBSZCgI1eRQhRFnS53KhybubdM58NK4uJOAlGQM7JACzlG5gsAGnxZBqhQ8ExRkeqwZDZD";
const Version = "v20.0";
const Phone_Number_ID = "368030019735172";
const axios = require("axios");

let sendMessage = async (recipientPhoneNumber, messageBody) => {
  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhoneNumber,
    type: "text",
    text: {
      preview_url: false,
      body: messageBody,
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${Version}/${Phone_Number_ID}/messages`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${YOUR_ACCESS_TOKEN} `,
        },
      }
    );
    console.log(response.data)
  } catch (error) {
    console.log(error.response.data);
  }
};

module.exports = { sendMessage };
