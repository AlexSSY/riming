// Import WalletCore package
const { initWasm } = require('@trustwallet/wallet-core');
const yaml = require('js-yaml');


const fs = require('fs');
const path = require('path');

// Log errors to a file
function logErrorToFile(message, error) {
  const logFilePath = path.join(__dirname, '../../log/wallet.log');
  const logMessage = `${new Date().toISOString()} - ${message}: ${error}\n`;
  fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf8' });
}

// Generate keys and addresses for all supported networks using a seed phrase
async function generateKeysAndAddressesAndSeed() {
  try {
    const walletCore = await initWasm();

    // Initialize the WalletCore classes
    const {
      HDWallet,
      CoinType,
      AnyAddress,
      CoinTypeConfiguration,
      HexCoding,
    } = walletCore;



    // Create an HD Wallet from the seed phrase
    // const wallet = HDWallet.createWithMnemonic(seedPhrase, "");
    const wallet = HDWallet.create(256, '')
    const seedPhrase = wallet.mnemonic()

    // Get all available CoinTypes
    // const allNetworks = Object.values(CoinType).filter(el => typeof(el) !== Number);
    // const allNetworks = Object.keys(CoinType).filter(el => el !== 'values');
    const allNetworks = Object.values(CoinType).filter(el => !Number.isInteger(el));

    const addresses = [];

    allNetworks.forEach((network) => {
      try {
        // var network = Object.getOwnPropertyDescriptor(CoinType, networkName)?.value

        // Derive the private key for the specific network
        const privateKey = wallet.getKeyForCoin(network);

        // Derive the public key from the private key
        const publicKey = privateKey.getPublicKeySecp256k1(true);

        // Derive the address from the public key for the specific network
        // const address = AnyAddress.createWithPublicKey(publicKey, network).description();
        const address = wallet.getAddressForCoin(network);

        // Get the network name from CoinTypeConfiguration
        const networkName = CoinTypeConfiguration.getName(network);
        const decimals = CoinTypeConfiguration.getDecimals(network);
        const symbol = CoinTypeConfiguration.getSymbol(network);

        addresses.push({
          network: networkName,
          symbol: symbol,
          decimals: decimals,
          privateKey: HexCoding.encode(privateKey.data()),
          publicKey: HexCoding.encode(publicKey.data()),
          address: address,
        });
      } catch (error) {
        logErrorToFile(`Failed to generate keys for network ${CoinTypeConfiguration.getName(network)}`, error);
      }
    });
    var result = {
      seedPhrase: seedPhrase,
      addresses: addresses,
    }
    console.log(yaml.dump(result));
    return result;
  } catch (error) {
    logErrorToFile("Failed to create wallet", error);
    var result = {
      seedPhrase: '',
      addresses: [],
    }
    console.log(yaml.dump(result));
    return result;
  }
}

generateKeysAndAddressesAndSeed();
