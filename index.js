// const cron = require("node-cron");
const dotenv = require("dotenv");

dotenv.config();

// cron.schedule("*/1 * * * *", () => {
(async () => {
  const puppeteer = require("puppeteer");
  const nodemailer = require("nodemailer");
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
      clientId: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      refreshToken: process.env.REFRESHTOKEN,
    },
  });

  let recipients = ["tahmidahmad001@gmail.com", "tahmidahmed1@usf.edu"]; //sriramc@usf.edu, otabek1@usf.edu

  function random_name_generator() {
    let characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    let length = 16;
    for (let i = length; i > 0; --i)
      result += characters[Math.round(Math.random() * (characters.length - 1))];
    return result;
  }
  const name = random_name_generator();
  const email = `${name}@examaple.c`;
  const emaillog = "habibi@gmail.com";
  const passwordlog = "1234567";
  const username = `${name}`;
  const password = "12345678";
  const fileToUpload = "./mos.jpg";

  const browser = await puppeteer.launch({
    headless: false,
  });
  let page = await browser.newPage();
  const start = new Date();
  console.time("Login+Upload+classifyTime");
  await page.goto("https://mona-species-class.web.app/");
  await page.click('span a[href="/login"]');
  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', emaillog);
  await page.type('input[name="password"]', passwordlog);
  await page.click('button[type="submit"]');
  // await page.click('span a[href="/register"]');
  // await page.type('input[name="displayName"]', name);
  // await page.type('input[name="email"]', email);
  // await page.type('input[name="passOne"]', password);
  // await page.type('input[name="passTwo"]', password);
  // await page.click('button[type="submit"]');

  await page.waitForSelector('a[href="/uploadimages"]');
  await page.click('a[href="/uploadimages"]');
  await page.waitForSelector(".btn-outline-info");

  await page.waitForSelector('input[type="file"]');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(fileToUpload);

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  setTimeout(async () => {
    await page.click("button.btn-outline-primary");
    await page.waitForSelector(".btn-outline-warning");
    await page.click("button.btn-outline-info.mr-2:nth-of-type(2)");
  }, 5000);

  try {
    await page.waitForFunction(
      () => {
        const img = document.querySelector('img[src*="predicted_images"]');
        return img && img.naturalWidth > 0 && img.naturalHeight > 0;
      },
      {
        timeout: 120000,
      }
    );

    await browser.close();
    console.timeEnd("Login+Upload+classifyTime");
    const end = new Date();
    const time = end - start;
    let date = new Date(time);
    let mailOptions = {
      from: "ahmadtahmid01@gmail.com",
      to: recipients.join(","),
      subject: "MosquitoID test-run Speed",
      text: `Tested Website Successfully. \n\n\nIt took ${date.getUTCMinutes()} minutes, ${date.getUTCSeconds()} seconds, and ${date.getUTCMilliseconds()} milli-seconds to login ---> upload image --> classify the mosquito image. \n\nCheers,\nTeam mosquitoes\n\n`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    await browser.close();
    let mailOptions = {
      from: "ahmadtahmid01@gmail.com",
      to: recipients.join(","),
      subject: "MosquitoID test-run Speed",
      text: `Classification is taking more than 2 minutes. Exited successfully.\n\nCheers,\nTeam mosquitoes\n\n`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
})();
