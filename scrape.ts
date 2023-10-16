import * as fs from "fs";
import * as path from "path";
import * as puppeteer from "puppeteer";

const pattern = "https://www.joiipetcare.com/health-conditions/*";
const startUrl = "https://www.joiipetcare.com/conditions/";

async function main() {
  const urls = await loadUrls();
  // const urls = ["https://www.joiipetcare.com/health-conditions/cat/abscesses/"];

  console.log(urls);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const data = [];

  for (const url of urls) {
    // Try load data from /html else scrape
    const filename = path.join(
      __dirname,
      "html",
      `${url.split("/").slice(-3, -1).join("-")}.html`
    );

    const file = Bun.file(filename);

    // if (file.exists()) {

    // } else {

    // }
    await page.goto(url);
    const html = await page.content();
    saveData(filename, html);

    // Extract text from html
    const text = await page.evaluate(() => {
      // @ts-ignore
      const text = document.querySelector(
        ".elementor-location-single"
      ).innerText;
      return text;
    });

    const json = {
      url,
      text,
      embedding: [],
    };

    data.push(json);

  }
  Bun.write("data.json", JSON.stringify(data, null, 2));
  await browser.close();
}

async function scrapeHtml(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  await browser.close();
  return html;
}

async function saveData(filename: string, data: any) {
  // save data to a file
  await Bun.write(filename, data);
}

async function loadUrls() {
  // load all urls from urls.txt and return them as an array
  const filename = path.join(__dirname, "urls.txt");
  const file = Bun.file(filename);
  const text = await file.text();
  return text.split("\n");
}

async function scrapeUrls() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(startUrl);
  const urls = await page.$$eval("a", (as) => as.map((a) => a.href));
  const filteredUrls = urls.filter((url) => url.match(pattern));
  const filename = path.join(__dirname, "urls.txt");
  fs.writeFileSync(filename, filteredUrls.join("\n"));
  await browser.close();
}

main();
