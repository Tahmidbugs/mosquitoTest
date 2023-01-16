// const cron = require("node-cron");
const dotenv = require("dotenv");

dotenv.config();

// cron.schedule("*/1 * * * *", () => {
(async () => {
  const puppeteer = require("puppeteer");
  const nodemailer = require("nodemailer");
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
  const email = `${name}@examaple.co`;
  const emaillog = "habibi@gmail.com";
  const passwordlog = "1234567";
  const username = `${name}`;
  const password = "12345678";
  const fileToUpload = "./mos.jpg";

  let browser = await puppeteer.launch({ headless: false });
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
  await page.waitForFunction(
    () => {
      const img = document.querySelector('img[src*="predicted_images"]');
      return img && img.naturalWidth > 0 && img.naturalHeight > 0;
    },
    {
      timeout: 60000,
    }
  );
  console.timeEnd("Login+Upload+classifyTime");
  const end = new Date();
  const time = end - start;
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

  let recipients = ["tahmidahmad001@gmail.com"];
  let mailOptions = {
    from: "ahmadtahmid01@gmail.com",
    to: recipients.join(","),
    subject: "Test email",
    text: `Testing the mosquito website. It took ${time} ms to login, upload image, classify the mosquito image`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
})();
