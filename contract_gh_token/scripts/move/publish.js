require("dotenv").config({ path: '../.env' });
const fs = require("node:fs");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

async function publish() {

  const aptosConfig = new aptosSDK.AptosConfig({network:process.env.VITE_APP_NETWORK})
  const aptos = new aptosSDK.Aptos(aptosConfig)

  // Make sure VITE_FA_CREATOR_ADDRESS is set
  if (!process.env.VITE_FA_CREATOR_ADDRESS) {
    throw new Error("Please set the VITE_FA_CREATOR_ADDRESS in the .env file");
  }

  // Make sure VITE_FA_CREATOR_ADDRESS exists
  try {
    await aptos.getAccountInfo({ accountAddress: process.env.VITE_FA_CREATOR_ADDRESS });
  } catch (error) {
    throw new Error(
      "Account does not exist. Make sure you have set up the correct address as the VITE_FA_CREATOR_ADDRESS in the .env file",
    );
  }

  if (!process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
    throw new Error(
      "VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY variable is not set, make sure you have set the publisher account address",
    );
  }

  if (!process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY) {
    throw new Error(
      "VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY variable is not set, make sure you have set the publisher account private key",
    );
  }

  const move = new cli.Move();

  move
    .createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "launchpad_addr",
      namedAddresses: {
        // Publish module to account address
        launchpad_addr: process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
        // This is the address you want to use to create fungible asset with, e.g. an address in Petra so you can create fungible asset in UI using Petra
        initial_creator_addr: process.env.VITE_FA_CREATOR_ADDRESS,
      },
      extraArguments: [`--private-key=${process.env.VITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,`--url=${aptosSDK.NetworkToNodeAPI[process.env.VITE_APP_NETWORK]}`],
    })
    .then((response) => {
      const filePath = ".env";
      let envContent = "";

      // Check .env file exists and read it
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, "utf8");
      }

      // Regular expression to match the VITE_MODULE_ADDRESS variable
      const regex = /^VITE_MODULE_ADDRESS_TOKEN=.*$/m;
      const newEntry = `VITE_MODULE_ADDRESS_TOKEN=${response.objectAddress}`;

      // Check if VITE_MODULE_ADDRESS is already defined
      if (envContent.match(regex)) {
        // If the variable exists, replace it with the new value
        envContent = envContent.replace(regex, newEntry);
      } else {
        // If the variable does not exist, append it
        envContent += `\n${newEntry}`;
      }

      // Write the updated content back to the .env file
      fs.writeFileSync(filePath, envContent, "utf8");
    });
}
publish();
