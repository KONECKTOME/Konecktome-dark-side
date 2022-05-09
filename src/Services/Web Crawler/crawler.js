const puppeteer = require("puppeteer");

async function scrapeChannel(website) {
  const browser = await puppeteer.launch();

  const registry = {};
  let queue = [website];
  while (queue.length > 0) {
    const url = queue[queue.length - 1];
    const page = await browser.newPage();
    await page.goto(url);
    registry[url] = await page.$eval("*", (el) => el.innerText);
    queue.pop();

    const hrefs = await page.$$eval("a", (anchorEls) =>
      anchorEls.map((a) => a.innerText)
    );

    const titleWithClassName = await page.$$eval(
      "div.content-wrapper",
      (anchorEls) => anchorEls.map((span) => span.innerText)
    );

    // const titleWithId = await page.$$eval("#\\get-notified-text", (anchorEls) =>
    //   anchorEls.map((span) => span.innerText)
    // );

    console.log("title", titleWithClassName);
    // const author = await page.$$eval("small.author", (anchorEls) =>
    //   anchorEls.map((small) => small.innerText)
    // );

    // const filteredHrefs = hrefs.filter(
    //   (href) => href.startsWith(website) && registry[href] === undefined
    // );

    // const uniqueHrefs = [...new Set(filteredHrefs)];

    // queue.push(...uniqueHrefs);
    // queue = [...new Set(queue)];

    await page.close();
  }

  browser.close();

  // return registry;
}

module.exports = {
  scrapeChannel,
};
