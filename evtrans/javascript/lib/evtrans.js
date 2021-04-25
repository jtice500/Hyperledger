'use strict';

const { Contract } = require('fabric-contract-api');

class evtrans extends Contract {


    async initLedger(ctx) {

        let temp = new Date()

        const assets = [
            {
               ID: 'asset1' ,
               Source: 'EV Station',
               Destination: 'Tom Cruise',
               Energy: 76,
               Price: 11.67,
               Time: temp.toString() ,
            },
            {
               ID: 'asset2' ,
               Source: 'EV Station',
               Destination: 'George Strait',
               Energy: 82,
               Price: 12.48,
               Time: temp.toString() ,
            },
            {
               ID: 'asset3' ,
               Source: 'EV Station',
               Destination: 'Elon Musk',
               Energy: 250,
               Price: 24.50,
               Time: temp.toString() ,
            },
            {
               ID: 'asset4' ,
               Source: 'EV Station',
               Destination: 'Joe Rogan',
               Energy: 42,
               Price: 5.25,
               Time: temp.toString() ,
            },
            {
               ID: 'asset5' ,
               Source: 'EV Station',
               Destination: 'Scarlet Johasson',
               Energy: 63,
               Price: 7.52,
               Time: temp.toString() ,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }


    async getTime(ctx) {
        
        return ctx.stub.getTxTimestamp();
    }

    // CreateAsset issues a new asset to the world state with given details.
    async createTrans(ctx, id, source, destination, energy, price) {

        const asset = {
            ID: id ,
            Source: source,
            Destination: destination,
            Energy: energy,
            Price: price,
            Time: new Date().toString() ,
        };
       
    
        if (asset.Energy < 10) {
          throw new Error('Must buy at least 10 energy');
        } else {
          ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
          count++;
          return JSON.stringify(asset);
        }
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, source, destination, energy, price) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        let temp = new Date()

        const updatedAsset = {
            ID: id,
            Source: source,
            Destination: destination,
            Energy: energy,
            Price: price,
            Time: new Date().toString() ,
        };

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Source = asset.Destination
        asset.Destination = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }


    
    // GetAllAssets returns all assets found in the world state.
    async queryLedger(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }

        let string = JSON.stringify(allResults);
        let array = string.split("}},")
        string = "";
        for (let i = 0; i < array.length; i++) {
            string = string + array[i] + "\n";
        }
        return string;
        
    }

    async getAssetNum(ctx) {

        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }

        return allResults.length;
        
    } 
}

module.exports = evtrans;
