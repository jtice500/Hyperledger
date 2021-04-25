const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');


export function submitTransaction(name, amount) {
    var assetid = 0;
    var source = 'Charging Station';
    var destination = name;
    var energy = amount;
    var price = 0; 
    var rate = 0.13; 

    await contract.submitTransaction('createTrans', assetid, source, destination, energy, price, rate);

}

async function main() {

    // var args = process.argv.slice(2);

    // let assetid = args[0];
    // let source = args[1];
    // let destination = args[2];
    // let energy = args[3];
    // let price = args[4];


    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('evtrans');

        // Submit the specified transaction.
        submitTransaction('James', 13);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();

// export function submitTransaction(name, amount) {
//     var assetid = 0;
//     var source = 'Charging Station';
//     var destination = name;
//     var energy = amount;
//     var price = 0; 
//     var rate = 0.13; 

//     await contract.submitTransaction('createTrans', assetid, source, destination, energy, price, rate);

// }
