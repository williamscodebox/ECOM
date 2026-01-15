//import sendMail from "./utils/mailer";
import { createConsumer, createKafkaClient } from "@repo/kafka";

const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "email-service");

const start = async () => {
  //   try {
  //     await consumer.connect();
  //     await consumer.subscribe([
  //       {
  //         topicName: "user.created",
  //         topicHandler: async (message) => {
  //           const { email, username } = message.value;
  //           if (email) {
  //             await sendMail({
  //               email,
  //               subject: "Welcome to E-commerce App",
  //               text: `Welcome ${username}. You account has been created!`,
  //             });
  //           }
  //         },
  //       },
  //       {
  //         topicName: "order.created",
  //         topicHandler: async (message) => {
  //           const { email, amount, status } = message.value;
  //           if (email) {
  //             await sendMail({
  //               email,
  //               subject: "Order has been created",
  //               text: `Hello! Your order: Amount: ${amount/100}, Status: ${status}`,
  //             });
  //           }
  //         },
  //       },
  //     ]);
  //   } catch (error) {
  //     console.log(error);
  //   }
};

start();

// Code below used for a test mailer

// try {
//     await sendMail({
//       email: "crewphil45@gmail.com",
//       subject: "Test",
//       text: "This is a test email from email service",
//     });
//   } catch (error) {
//     console.log(error);
//   }
