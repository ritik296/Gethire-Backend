const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
});

const SubscriptionSchema = new mongoose.Schema({
  premiumFor: {
    type: String,
    required: true,
    enum: ["Student", "Company", "College"],
  },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  paymentDetails: { type: [PaymentSchema], required: true },
  expireOn: { type: Date, required: true },
  subscriptionType: {
    type: String,
    enum: ["Silver", "Gold", "Platinum"],
    required: true,
  },
});

const SubscriptionModel = mongoose.model("Subscription", SubscriptionSchema);
module.exports = SubscriptionModel;
