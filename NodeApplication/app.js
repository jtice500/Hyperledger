// imports
const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();

const PORT = 4000
//import main from './public/js/createTrans.js';


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

app.engine('hbs', hbs({ extname: 'hbs'}));
app.set('view engine', 'hbs');

// listen on port 4000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// static files
app.use(express.static('public'));

// Set Views

app.get('/', (req, res) => {
    res.render('main', {layout: false});
});

app.post('/invoke', async (req, res) => {

    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryledger, asset1')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryLedger');
        JSON.stringify(result);
        res.render('main', {test: result, layout: false});
        console.log('transaction without toString()\n' + result);

        

        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
});

