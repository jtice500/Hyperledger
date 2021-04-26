// imports
const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();

const PORT = 4000


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//fabric API
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

app.get('/query', async (req, res) => {

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
        //const result = await contract.evaluateTransaction('queryLedger');
        let result = await contract.evaluateTransaction('queryLedger');
        result = JSON.parse(result);


        let string = '';
        let i;
        for (i = 0; i < await contract.evaluateTransaction('getAssetNum'); i++)
        {
            string = string + '\n' + result[i].Key + ' Source: ' + result[i].Record.Source + " Destination: " + result[i].Record.Destination + ' Energy: ' + result[i].Record.Energy + ' Price: ' + result[i].Record.Price;

        }

        console.log(string);
        res.render('main', {test: string, title: 'TRANSACTIONS', layout: false});
        console.log('transaction without toString()\n' + result);

        

        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }

    app.post('/invoke', async (req,res) => {
        console.log('hello from invoke');
        //let assetid = args[0];
        let source = 'Charging Station';
        let destination = req.body.nameField;
        let energy = req.body.energyField;
        //let price = energy * .13;


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

            let count = await contract.evaluateTransaction('getAssetNum');
            count = parseInt(count) + 1;

            let assetid = 'asset' + count;

            // Submit the specified transaction.
            await contract.submitTransaction('createTrans', assetid, source, destination, energy);
            
            console.log('Transaction has been submitted');
            res.render('main', {title: 'Transaction submitted successfully', layout: false});

            // Disconnect from the gateway.
            gateway.disconnect();

        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            process.exit(1);
        }
    });
});

