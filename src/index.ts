import { Builder, Browser, By, until, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

async function openChrome(driver: WebDriver) {

  try {
    await driver.get('https://meet.google.com/hht-qqqn-znp');
    const popupButton = await driver.wait(until.elementLocated(By.xpath('//span[contains(text(), "Got it")]')), 10000);
    await popupButton.click();
    const nameInput = await driver.wait(until.elementLocated(By.xpath('//input[@placeholder="Your name"]')), 10000);
    await nameInput.clear();
    await nameInput.click();
    await nameInput.sendKeys('value', "Meeting bot");
    await driver.sleep(1000);
    const buttonInput = await driver.wait(until.elementLocated(By.xpath('//span[contains(text(), "Ask to join")]')), 10000);
    buttonInput.click();
    
  } finally {
    // await driver.quit()
  }

};

async function getDriver() {
  const options = new Options({});
  options.addArguments("--disable-blink-features=AutomationControlled");
  options.addArguments("--use-fake-ui-for-media-stream");
  options.addArguments("--window-size=1080,720");
  options.addArguments("--auto-select-desktop-capture-source=[RECORD]");
  options.addArguments("--enable-usermedia-screen-capturing")
  let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  return driver;
}

async function startScreenshare(driver: WebDriver) {
  console.log("startScreenshare called");
  const response = await driver.executeScript(`

    function wait(delayInMS) {
      return new Promise((resolve) => setTimeout(resolve, delayInMS));
    }

    
    function startRecording(stream, lengthInMS) {
      let recorder = new MediaRecorder(stream);
      let data = [];

      recorder.ondataavailable = (event) => data.push(event.data);
      recorder.start();

      let stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = (event) => reject(event.name);
      });

      let recorded = wait(lengthInMS).then(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      });

      return Promise.all([stopped, recorded]).then(() => data);
    }

    
    
    window.navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      preferCurrentTab: true
    }).then(async stream => {
      const recordedChunks = await startRecording(stream, 5000);
      let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
      const recording = document.createElement("video");
      recording.src = URL.createObjectURL(recordedBlob);
      const downloadButton = document.createElement("a");
      downloadButton.href = recording.src;
      downloadButton.download = "RecordedVideo.webm";
      downloadButton.click();
    })

  `);
  
  console.log(response);
  driver.sleep(30000);
  
}

async function main() {
  const driver = await getDriver();
  await openChrome(driver);
  // wait until admin lets u join
  await startScreenshare(driver);

}

main();